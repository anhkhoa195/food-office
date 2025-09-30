import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { BillingService } from './billing.service';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('reports/weekly')
  @ApiOperation({ summary: 'Generate weekly billing report' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Weekly report generated successfully' })
  async getWeeklyReport(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.billingService.generateWeeklyReport(user.companyId, startDate, endDate);
  }

  @Get('reports/monthly')
  @ApiOperation({ summary: 'Generate monthly billing report' })
  @ApiQuery({ name: 'year', required: true, description: 'Year (YYYY)' })
  @ApiQuery({ name: 'month', required: true, description: 'Month (1-12)' })
  @ApiResponse({ status: 200, description: 'Monthly report generated successfully' })
  async getMonthlyReport(
    @CurrentUser() user: CurrentUserData,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.billingService.generateMonthlyReport(user.companyId, parseInt(year), parseInt(month));
  }

  @Get('export/weekly')
  @ApiOperation({ summary: 'Export weekly report as PDF' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (pdf or excel)', enum: ['pdf', 'excel'] })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportWeeklyReport(
    @CurrentUser() user: CurrentUserData,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @Res() res: Response,
  ) {
    const buffer = await this.billingService.exportWeeklyReport(user.companyId, startDate, endDate, format);
    
    const filename = `weekly-report-${startDate}${endDate ? `-${endDate}` : ''}.${format}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    
    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('export/monthly')
  @ApiOperation({ summary: 'Export monthly report as PDF or Excel' })
  @ApiQuery({ name: 'year', required: true, description: 'Year (YYYY)' })
  @ApiQuery({ name: 'month', required: true, description: 'Month (1-12)' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (pdf or excel)', enum: ['pdf', 'excel'] })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportMonthlyReport(
    @CurrentUser() user: CurrentUserData,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @Res() res: Response,
  ) {
    const buffer = await this.billingService.exportMonthlyReport(user.companyId, parseInt(year), parseInt(month), format);
    
    const filename = `monthly-report-${year}-${month.toString().padStart(2, '0')}.${format}`;
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    
    res.status(HttpStatus.OK).send(buffer);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get billing summary for current month' })
  @ApiResponse({ status: 200, description: 'Billing summary retrieved successfully' })
  async getBillingSummary(@CurrentUser() user: CurrentUserData) {
    return this.billingService.getBillingSummary(user.companyId);
  }
}
