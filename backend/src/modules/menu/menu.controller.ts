import { Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@ApiTags('Menu')
@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get menu items for user company' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiQuery({ name: 'available', required: false, description: 'Filter by availability' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully' })
  async getMenuItems(
    @CurrentUser() user: CurrentUserData,
    @Query('category') category?: string,
    @Query('available') available?: string,
  ) {
    return this.menuService.getMenuItems(user.companyId, {
      category,
      available: available === 'true',
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create new menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createMenuItem(
    @CurrentUser() user: CurrentUserData,
    @Body() createMenuItemDto: CreateMenuItemDto,
  ) {
    return this.menuService.createMenuItem(user.companyId, createMenuItemDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({ status: 200, description: 'Menu item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async getMenuItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.getMenuItem(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async updateMenuItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async deleteMenuItem(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.deleteMenuItem(id);
  }

  @Get('categories/list')
  @ApiOperation({ summary: 'Get all menu categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@CurrentUser() user: CurrentUserData) {
    return this.menuService.getCategories(user.companyId);
  }
}
