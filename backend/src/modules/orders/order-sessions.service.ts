import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderSessionDto, UpdateOrderSessionDto } from './dto/order.dto';

@Injectable()
export class OrderSessionsService {
  constructor(private prisma: PrismaService) {}

  async getOrderSessions(companyId: string, filters?: { active?: boolean }) {
    const where: any = {
      companyId,
    };

    if (filters?.active !== undefined) {
      where.isActive = filters.active;
    }

    const sessions = await this.prisma.orderSession.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      createdBy: session.createdBy,
      orderCount: session._count.orders,
    }));
  }

  async createOrderSession(companyId: string, createdById: string, createOrderSessionDto: CreateOrderSessionDto) {
    const session = await this.prisma.orderSession.create({
      data: {
        ...createOrderSessionDto,
        companyId,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      createdBy: session.createdBy,
      orderCount: 0,
    };
  }

  async getOrderSession(id: string) {
    const session = await this.prisma.orderSession.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Order session not found');
    }

    return {
      id: session.id,
      title: session.title,
      description: session.description,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      createdBy: session.createdBy,
      orderCount: session._count.orders,
    };
  }

  async updateOrderSession(id: string, updateOrderSessionDto: UpdateOrderSessionDto) {
    const session = await this.prisma.orderSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Order session not found');
    }

    const updatedSession = await this.prisma.orderSession.update({
      where: { id },
      data: updateOrderSessionDto,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return {
      id: updatedSession.id,
      title: updatedSession.title,
      description: updatedSession.description,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      isActive: updatedSession.isActive,
      createdAt: updatedSession.createdAt,
      updatedAt: updatedSession.updatedAt,
      createdBy: updatedSession.createdBy,
      orderCount: updatedSession._count.orders,
    };
  }

  async deleteOrderSession(id: string) {
    const session = await this.prisma.orderSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Order session not found');
    }

    await this.prisma.orderSession.delete({
      where: { id },
    });

    return { message: 'Order session deleted successfully' };
  }
}
