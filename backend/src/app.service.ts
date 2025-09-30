import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; timestamp: string; version: string } {
    return {
      message: 'OfficeFood API is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getDetailedHealth(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
