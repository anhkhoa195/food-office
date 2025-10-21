import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service for managing user-related operations.
 */
@Injectable()
export class UsersService {
  /**
   * Creates an instance of UsersService.
   * @param prisma The PrismaService instance for database access.
   */
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves the profile of a user by their ID.
   * @param userId The ID of the user.
   * @returns The formatted user profile.
   * @throws NotFoundException if the user is not found.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUser(user);
  }

  /**
   * Updates the profile of a user.
   * @param userId The ID of the user to update.
   * @param updateUserDto The data transfer object containing updated user information.
   * @returns The updated user profile.
   * @throws NotFoundException if the user is not found or validation fails.
   */
  async updateProfile(userId: string, updateUserDto: UpdateUserDto) {
    // Validate updateUserDto
    const { validate } = await import('class-validator');
    const errors = await validate(updateUserDto);
    if (errors.length > 0) {
      throw new NotFoundException('Validation failed: ' + JSON.stringify(errors));
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      return this.formatUser(updatedUser);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Formats a user object for response.
   * @param user The user object to format.
   * @returns The formatted user object.
   */
  private formatUser(user: any) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUser(id: string) {

    // Implementation to find and return user by id

    // This might involve database query or repository call

    return await this.prisma.user.findUnique({ where: { id } });

  }
}
