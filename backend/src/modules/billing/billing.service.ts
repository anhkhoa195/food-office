import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async generateWeeklyReport(companyId: string, startDate: string, endDate?: string) {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

    const orders = await this.prisma.order.findMany({
      where: {
        session: {
          companyId,
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const uniqueUsers = new Set(orders.map(order => order.userId)).size;

    return {
      period: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      },
      summary: {
        totalAmount,
        totalOrders,
        uniqueUsers,
        averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
      },
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        user: order.user,
        session: order.session,
        orderItems: order.orderItems.map(item => ({
          quantity: item.quantity,
          price: Number(item.price),
          menuItem: {
            name: item.menuItem.name,
            category: item.menuItem.category,
          },
        })),
      })),
    };
  }

  async generateMonthlyReport(companyId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const orders = await this.prisma.order.findMany({
      where: {
        session: {
          companyId,
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const uniqueUsers = new Set(orders.map(order => order.userId)).size;

    // Group by day
    const ordersByDay = orders.reduce((acc, order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(order);
      return acc;
    }, {} as Record<string, typeof orders>);

    const dailyStats = Object.entries(ordersByDay).map(([day, dayOrders]) => ({
      date: day,
      totalAmount: dayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      totalOrders: dayOrders.length,
      uniqueUsers: new Set(dayOrders.map(order => order.userId)).size,
    }));

    return {
      period: {
        year,
        month,
        monthName: start.toLocaleString('default', { month: 'long' }),
      },
      summary: {
        totalAmount,
        totalOrders,
        uniqueUsers,
        averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
      },
      dailyStats,
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        user: order.user,
        session: order.session,
        orderItems: order.orderItems.map(item => ({
          quantity: item.quantity,
          price: Number(item.price),
          menuItem: {
            name: item.menuItem.name,
            category: item.menuItem.category,
          },
        })),
      })),
    };
  }

  async exportWeeklyReport(companyId: string, startDate: string, endDate?: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Buffer> {
    const report = await this.generateWeeklyReport(companyId, startDate, endDate);
    
    if (format === 'excel') {
      return this.generateExcelReport(report, 'Weekly Report');
    } else {
      // For PDF, we'll return a simple text representation
      // In a real application, you'd use a PDF library like puppeteer or jsPDF
      const pdfContent = this.generateTextReport(report);
      return Buffer.from(pdfContent, 'utf-8');
    }
  }

  async exportMonthlyReport(companyId: string, year: number, month: number, format: 'pdf' | 'excel' = 'pdf'): Promise<Buffer> {
    const report = await this.generateMonthlyReport(companyId, year, month);
    
    if (format === 'excel') {
      return this.generateExcelReport(report, 'Monthly Report');
    } else {
      // For PDF, we'll return a simple text representation
      // In a real application, you'd use a PDF library like puppeteer or jsPDF
      const pdfContent = this.generateTextReport(report);
      return Buffer.from(pdfContent, 'utf-8');
    }
  }

  private async generateExcelReport(report: any, title: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add title
    worksheet.addRow([title]);
    worksheet.addRow([`Period: ${report.period.startDate} to ${report.period.endDate || report.period.monthName}`]);
    worksheet.addRow([]);

    // Add summary
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Amount', report.summary.totalAmount]);
    worksheet.addRow(['Total Orders', report.summary.totalOrders]);
    worksheet.addRow(['Unique Users', report.summary.uniqueUsers]);
    worksheet.addRow(['Average Order Value', report.summary.averageOrderValue]);
    worksheet.addRow([]);

    // Add orders
    worksheet.addRow(['Orders']);
    worksheet.addRow(['ID', 'Status', 'Total Amount', 'User', 'Session', 'Created At']);
    
    report.orders.forEach((order: any) => {
      worksheet.addRow([
        order.id,
        order.status,
        order.totalAmount,
        order.user.name || order.user.phone,
        order.session.title,
        order.createdAt,
      ]);
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private generateTextReport(report: any): string {
    let content = `OFFICEFOOD BILLING REPORT\n`;
    content += `========================\n\n`;
    content += `Period: ${report.period.startDate} to ${report.period.endDate || report.period.monthName}\n\n`;
    content += `SUMMARY\n`;
    content += `-------\n`;
    content += `Total Amount: $${report.summary.totalAmount.toFixed(2)}\n`;
    content += `Total Orders: ${report.summary.totalOrders}\n`;
    content += `Unique Users: ${report.summary.uniqueUsers}\n`;
    content += `Average Order Value: $${report.summary.averageOrderValue.toFixed(2)}\n\n`;
    content += `ORDERS\n`;
    content += `------\n`;
    
    report.orders.forEach((order: any) => {
      content += `Order ID: ${order.id}\n`;
      content += `Status: ${order.status}\n`;
      content += `Amount: $${order.totalAmount.toFixed(2)}\n`;
      content += `User: ${order.user.name || order.user.phone}\n`;
      content += `Session: ${order.session.title}\n`;
      content += `Date: ${order.createdAt}\n`;
      content += `Items:\n`;
      order.orderItems.forEach((item: any) => {
        content += `  - ${item.menuItem.name} (${item.quantity}x) - $${item.price.toFixed(2)}\n`;
      });
      content += `\n`;
    });

    return content;
  }

  async getBillingSummary(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const orders = await this.prisma.order.findMany({
      where: {
        session: {
          companyId,
        },
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalOrders = orders.length;
    const uniqueUsers = new Set(orders.map(order => order.userId)).size;

    // Get previous month for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const lastMonthOrders = await this.prisma.order.findMany({
      where: {
        session: {
          companyId,
        },
        createdAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    const lastMonthTotal = lastMonthOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const growthPercentage = lastMonthTotal > 0 ? ((totalAmount - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    return {
      currentMonth: {
        totalAmount,
        totalOrders,
        uniqueUsers,
        averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
      },
      previousMonth: {
        totalAmount: lastMonthTotal,
        totalOrders: lastMonthOrders.length,
      },
      growth: {
        amount: totalAmount - lastMonthTotal,
        percentage: growthPercentage,
      },
      period: {
        current: {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          monthName: now.toLocaleString('default', { month: 'long' }),
        },
        previous: {
          year: startOfLastMonth.getFullYear(),
          month: startOfLastMonth.getMonth() + 1,
          monthName: startOfLastMonth.toLocaleString('default', { month: 'long' }),
        },
      },
    };
  }
}
