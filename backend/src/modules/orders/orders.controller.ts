import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { OrderSessionsService } from './order-sessions.service';
import { CreateOrderDto, UpdateOrderDto, CreateOrderSessionDto, UpdateOrderSessionDto } from './dto/order.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderSessionsService: OrderSessionsService,
  ) {}

  // Order Sessions
  @Get('sessions')
  @ApiOperation({ summary: 'Get order sessions for current user company' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Order sessions retrieved successfully' })
  async getOrderSessions(
    @CurrentUser() user: CurrentUserData,
    @Query('active') active?: string,
  ) {
    if (!user || !user.companyId) {
      throw new UnauthorizedException('User not authenticated or company not found');
    }
    return this.orderSessionsService.getOrderSessions(user.companyId, {
      active: active === 'true',
    });
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Create new order session' })
  @ApiResponse({ status: 201, description: 'Order session created successfully' })
  async createOrderSession(
    @CurrentUser() user: CurrentUserData,
    @Body() createOrderSessionDto: CreateOrderSessionDto,
  ) {
    if (!user || !user.companyId || !user.id) {
      throw new UnauthorizedException('User not authenticated or company not found');
    }
    return this.orderSessionsService.createOrderSession(user.companyId, user.id, createOrderSessionDto);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get order session by ID' })
  @ApiResponse({ status: 200, description: 'Order session retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order session not found' })
  async getOrderSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderSessionsService.getOrderSession(id);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Update order session' })
  @ApiResponse({ status: 200, description: 'Order session updated successfully' })
  @ApiResponse({ status: 404, description: 'Order session not found' })
  async updateOrderSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderSessionDto: UpdateOrderSessionDto,
  ) {
    return this.orderSessionsService.updateOrderSession(id, updateOrderSessionDto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete order session' })
  @ApiResponse({ status: 200, description: 'Order session deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order session not found' })
  async deleteOrderSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderSessionsService.deleteOrderSession(id);
  }

  // Orders
  @Get()
  @ApiOperation({ summary: 'Get orders for current user' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Filter by session ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrders(
    @CurrentUser() user: CurrentUserData,
    @Query('sessionId') sessionId?: string,
    @Query('status') status?: string,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ordersService.getOrders(user.id, {
      sessionId,
      status,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(
    @CurrentUser() user: CurrentUserData,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.ordersService.createOrder(user.id, createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrder(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.deleteOrder(id);
  }

  @Get('sessions/:sessionId/orders')
  @ApiOperation({ summary: 'Get all orders for a specific session' })
  @ApiResponse({ status: 200, description: 'Session orders retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order session not found' })
  async getSessionOrders(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.ordersService.getSessionOrders(sessionId);
  }
}
