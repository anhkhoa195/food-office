import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrders(userId: string, filters?: { sessionId?: string; status?: string }) {
    const where: any = {
      userId,
    };

    if (filters?.sessionId) {
      where.sessionId = filters.sessionId;
    }

    if (filters?.status) {
      where.status = filters.status as OrderStatus;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      session: order.session,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          category: item.menuItem.category,
          imageUrl: item.menuItem.imageUrl,
        },
      })),
    }));
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // Verify session exists and is active
    const session = await this.prisma.orderSession.findUnique({
      where: { id: createOrderDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Order session not found');
    }

    if (!session.isActive) {
      throw new BadRequestException('Order session is not active');
    }

    // Verify menu items exist
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: createOrderDto.orderItems.map(item => item.menuItemId) },
      },
    });

    if (menuItems.length !== createOrderDto.orderItems.length) {
      throw new BadRequestException('One or more menu items not found');
    }

    // Calculate total amount
    const totalAmount = createOrderDto.orderItems.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      return total + (menuItem ? Number(menuItem.price) * item.quantity : 0);
    }, 0);

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        totalAmount,
        notes: createOrderDto.notes,
        userId,
        sessionId: createOrderDto.sessionId,
        orderItems: {
          create: createOrderDto.orderItems.map(item => {
            const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
            return {
              quantity: item.quantity,
              price: menuItem ? menuItem.price : 0,
              notes: item.notes,
              menuItemId: item.menuItemId,
            };
          }),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
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
    });

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      session: order.session,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          category: item.menuItem.category,
          imageUrl: item.menuItem.imageUrl,
        },
      })),
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            menuItem: true,
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
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      session: order.session,
      user: order.user,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          category: item.menuItem.category,
          imageUrl: item.menuItem.imageUrl,
        },
      })),
    };
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
      include: {
        orderItems: {
          include: {
            menuItem: true,
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
    });

    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      totalAmount: updatedOrder.totalAmount,
      notes: updatedOrder.notes,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
      session: updatedOrder.session,
      orderItems: updatedOrder.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          description: item.menuItem.description,
          category: item.menuItem.category,
          imageUrl: item.menuItem.imageUrl,
        },
      })),
    };
  }

  async deleteOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.prisma.order.delete({
      where: { id },
    });

    return { message: 'Order deleted successfully' };
  }

  async getSessionOrders(sessionId: string) {
    const session = await this.prisma.orderSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Order session not found');
    }

    const orders = await this.prisma.order.findMany({
      where: { sessionId },
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
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
      },
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        user: order.user,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          menuItem: {
            id: item.menuItem.id,
            name: item.menuItem.name,
            description: item.menuItem.description,
            category: item.menuItem.category,
            imageUrl: item.menuItem.imageUrl,
          },
        })),
      })),
    };
  }
}
