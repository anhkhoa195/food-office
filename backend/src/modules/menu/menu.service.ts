import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async getMenuItems(companyId: string, filters?: { category?: string; available?: boolean }) {
    const where: any = {
      companyId,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.available !== undefined) {
      where.isAvailable = filters.available;
    }

    const menuItems = await this.prisma.menuItem.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    return menuItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  async createMenuItem(companyId: string, createMenuItemDto: CreateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.create({
      data: {
        ...createMenuItemDto,
        companyId,
      },
    });

    return {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      imageUrl: menuItem.imageUrl,
      isAvailable: menuItem.isAvailable,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  async getMenuItem(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      imageUrl: menuItem.imageUrl,
      isAvailable: menuItem.isAvailable,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
    });

    return {
      id: updatedMenuItem.id,
      name: updatedMenuItem.name,
      description: updatedMenuItem.description,
      price: updatedMenuItem.price,
      category: updatedMenuItem.category,
      imageUrl: updatedMenuItem.imageUrl,
      isAvailable: updatedMenuItem.isAvailable,
      createdAt: updatedMenuItem.createdAt,
      updatedAt: updatedMenuItem.updatedAt,
    };
  }

  async deleteMenuItem(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.prisma.menuItem.delete({
      where: { id },
    });

    return { message: 'Menu item deleted successfully' };
  }

  async getCategories(companyId: string) {
    const categories = await this.prisma.menuItem.findMany({
      where: { companyId },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return categories.map(cat => cat.category);
  }
}
