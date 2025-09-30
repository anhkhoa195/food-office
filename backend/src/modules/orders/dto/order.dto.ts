import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsDateString, IsEnum, ValidateNested, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Menu item ID',
    example: 'clh1234567890',
  })
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty({
    description: 'Quantity of the menu item',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @ApiProperty({
    description: 'Special notes for this order item',
    example: 'Extra dressing on the side',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order session ID',
    example: 'clh1234567890',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Special notes for the entire order',
    example: 'Please deliver to the main entrance',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateOrderDto {
  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Special notes for the entire order',
    example: 'Please deliver to the main entrance',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateOrderSessionDto {
  @ApiProperty({
    description: 'Order session title',
    example: 'Monday Lunch Order',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Order session description',
    example: 'Weekly team lunch order',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Order session start time',
    example: '2024-01-15T09:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Order session end time',
    example: '2024-01-15T11:00:00Z',
  })
  @IsDateString()
  endTime: string;
}

export class UpdateOrderSessionDto {
  @ApiProperty({
    description: 'Order session title',
    example: 'Monday Lunch Order',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Order session description',
    example: 'Weekly team lunch order',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Order session start time',
    example: '2024-01-15T09:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiProperty({
    description: 'Order session end time',
    example: '2024-01-15T11:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiProperty({
    description: 'Whether the order session is active',
    example: true,
    required: false,
  })
  @IsOptional()
  isActive?: boolean;
}
