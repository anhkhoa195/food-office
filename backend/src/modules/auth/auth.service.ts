import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { OtpService } from './otp.service';
import { CurrentUserData } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  async sendOtp(phone: string) {
    // Generate and store OTP
    const otpCode = await this.otpService.generateOtp(phone);
    
    // In a real application, you would send this OTP via SMS
    // For development, we'll just log it
    console.log(`📱 OTP for ${phone}: ${otpCode}`);
    
    const expiresIn = parseInt(this.configService.get('OTP_EXPIRES_IN', '300'));
    
    return {
      message: 'OTP sent successfully',
      expiresIn,
      // In development, include the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp: otpCode }),
    };
  }

  async verifyOtp(phone: string, code: string) {
    // Verify OTP
    const isValid = await this.otpService.verifyOtp(phone, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await this.prisma.user.create({
        data: {
          phone,
          name: null,
          email: null,
        },
      });
    }

    // Generate tokens
    const payload: CurrentUserData = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Mark OTP as used
    await this.otpService.markOtpAsUsed(phone, code);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Verify user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload: CurrentUserData = {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: CurrentUserData): Promise<CurrentUserData> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
  }
}
