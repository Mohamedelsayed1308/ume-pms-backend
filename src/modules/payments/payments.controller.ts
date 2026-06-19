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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, CompletePaymentDto, CancelPaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: PaymentResponseDto })
  async create(@Body() createPaymentDto: CreatePaymentDto, @Request() req): Promise<Payment> {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'supplier_id', required: false, type: String, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'invoice_id', required: false, type: String, description: 'Filter by invoice ID' })
  @ApiResponse({ status: 200, description: 'List of payments', type: [PaymentResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: PaymentStatus,
    @Query('supplier_id') supplier_id?: string,
    @Query('invoice_id') invoice_id?: string,
  ): Promise<{ data: Payment[]; total: number }> {
    return this.paymentsService.findAll(page, limit, status, supplier_id, invoice_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID with invoice and supplier details' })
  @ApiResponse({ status: 200, description: 'Payment details', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findById(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a payment (only if status is pending)' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending payments can be updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a payment (set status to completed and update invoice paid_amount)' })
  @ApiResponse({ status: 200, description: 'Payment completed successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending payments can be completed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async complete(
    @Param('id') id: string,
    @Body() completePaymentDto: CompletePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.complete(id, completePaymentDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a payment (set status to cancelled)' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending payments can be cancelled' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async cancel(
    @Param('id') id: string,
    @Body() cancelPaymentDto: CancelPaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.cancel(id, cancelPaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a payment (only if status is pending)' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only pending payments can be deleted' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    const deletedBy = req.user?.email || req.user?.id || 'system';
    await this.paymentsService.softDelete(id, deletedBy);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a deleted payment' })
  @ApiResponse({ status: 200, description: 'Payment restored successfully', type: PaymentResponseDto })
  @ApiResponse({ status: 404, description: 'Deleted payment not found' })
  async restore(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.restore(id);
  }
}
