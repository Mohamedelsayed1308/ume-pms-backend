import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto, ApprovePurchaseOrderDto, RejectPurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PurchaseOrderResponseDto } from './dto/purchase-order-response.dto';
import { PurchaseOrder, POStatus } from './entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully', type: PurchaseOrderResponseDto })
  async create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto, @Request() req): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all purchase orders with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'supplier_id', required: false, type: String, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'vessel_id', required: false, type: String, description: 'Filter by vessel ID' })
  @ApiResponse({ status: 200, description: 'List of purchase orders', type: [PurchaseOrderResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: POStatus,
    @Query('supplier_id') supplier_id?: string,
    @Query('vessel_id') vessel_id?: string,
  ): Promise<{ data: PurchaseOrder[]; total: number }> {
    return this.purchaseOrdersService.findAll(page, limit, status, supplier_id, vessel_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase order by ID with items and supplier details' })
  @ApiResponse({ status: 200, description: 'Purchase order details', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async findById(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a purchase order (only if status is draft)' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Only draft POs can be updated' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a purchase order for approval (change status from draft to pending_approval)' })
  @ApiResponse({ status: 200, description: 'Purchase order submitted successfully', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Only draft POs can be submitted' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async submit(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a purchase order (set status to approved)' })
  @ApiResponse({ status: 200, description: 'Purchase order approved successfully', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending approval POs can be approved' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async approve(
    @Param('id') id: string,
    @Body() approvePurchaseOrderDto: ApprovePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.approve(id, approvePurchaseOrderDto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a purchase order (set status to rejected)' })
  @ApiResponse({ status: 200, description: 'Purchase order rejected successfully', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending approval POs can be rejected' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectPurchaseOrderDto: RejectPurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.reject(id, rejectPurchaseOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a purchase order (only if status is draft)' })
  @ApiResponse({ status: 204, description: 'Purchase order deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft POs can be deleted' })
  @ApiResponse({ status: 404, description: 'Purchase order not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    const deletedBy = req.user?.email || req.user?.id || 'system';
    await this.purchaseOrdersService.softDelete(id, deletedBy);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a deleted purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order restored successfully', type: PurchaseOrderResponseDto })
  @ApiResponse({ status: 404, description: 'Deleted purchase order not found' })
  async restore(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.purchaseOrdersService.restore(id);
  }
}
