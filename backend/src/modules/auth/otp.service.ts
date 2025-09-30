import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateOtp(phone: string): Promise<string> {
    // In development, use mock OTP
    if (process.env.NODE_ENV === 'development') {
      const mockOtp = this.configService.get('MOCK_OTP_CODE', '123456');
      await this.storeOtp(phone, mockOtp);
      return mockOtp;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in database
    await this.storeOtp(phone, otp);
    
    return otp;
  }

  private async storeOtp(phone: string, code: string): Promise<void> {
    const expiresIn = parseInt(this.configService.get('OTP_EXPIRES_IN', '300'));
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Delete any existing OTPs for this phone
    await this.prisma.otpCode.deleteMany({
      where: { phone },
    });

    // Store new OTP
    await this.prisma.otpCode.create({
      data: {
        phone,
        code,
        expiresAt,
      },
    });
  }

  async verifyOtp(phone: string, code: string): Promise<boolean> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!otpRecord;
  }

  async markOtpAsUsed(phone: string, code: string): Promise<void> {
    await this.prisma.otpCode.updateMany({
      where: {
        phone,
        code,
      },
      data: {
        isUsed: true,
      },
    });
  }

  async cleanupExpiredOtps(): Promise<void> {
    await this.prisma.otpCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true },
        ],
      },
    });
  }
}
