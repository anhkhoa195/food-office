import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderSessionsService } from './order-sessions.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderSessionsService],
  exports: [OrdersService, OrderSessionsService],
})
export class OrdersModule {}
