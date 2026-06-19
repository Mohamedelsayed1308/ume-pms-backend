import {
  Controller, Post, Get, Put, Delete, Body, Param,
  Query, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto, ApprovePurchaseOrderDto, RejectPurchaseOrderDto } from './dto/update-purchase-order.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'supplier_id', required: false, type: String })
  @ApiQuery({ name: 'vessel_id', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('supplier_id') supplier_id?: string,
    @Query('vessel_id') vessel_id?: string,
  ) {
    return this.purchaseOrdersService.findAll(+page, +limit, status as any, supplier_id, vessel_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async findById(@Param('id') id: string) {
    return this.purchaseOrdersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update purchase order (draft only)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrdersService.update(id, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit purchase order for approval' })
  async submit(@Param('id') id: string) {
    return this.purchaseOrdersService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve purchase order' })
  async approve(@Param('id') id: string, @Body() dto: ApprovePurchaseOrderDto) {
    return this.purchaseOrdersService.approve(id, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject purchase order' })
  async reject(@Param('id') id: string, @Body() dto: RejectPurchaseOrderDto) {
    return this.purchaseOrdersService.reject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete purchase order (draft only)' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.purchaseOrdersService.softDelete(id, req.user.id);
    return { message: 'Purchase order deleted successfully' };
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted purchase order' })
  async restore(@Param('id') id: string) {
    return this.purchaseOrdersService.restore(id);
  }
}
