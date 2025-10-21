import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  getHealth(): { message: string; timestamp: string; version: string } {
    return this.appService.getHealth();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Get detailed health check' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  getDetailedHealth(): { status: string; uptime: number; timestamp: string } {
    return this.appService.getDetailedHealth();
  }
}
