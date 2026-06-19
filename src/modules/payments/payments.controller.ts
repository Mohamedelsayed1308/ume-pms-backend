import {
  Controller, Post, Get, Put, Delete, Body, Param,
  Query, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, CompletePaymentDto, CancelPaymentDto } from './dto/update-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'supplier_id', required: false, type: String })
  @ApiQuery({ name: 'invoice_id', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('supplier_id') supplier_id?: string,
    @Query('invoice_id') invoice_id?: string,
  ) {
    return this.paymentsService.findAll(+page, +limit, status as any, supplier_id, invoice_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  async findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment (pending only)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete payment' })
  async complete(@Param('id') id: string, @Body() dto: CompletePaymentDto) {
    return this.paymentsService.complete(id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel payment' })
  async cancel(@Param('id') id: string, @Body() dto: CancelPaymentDto) {
    return this.paymentsService.cancel(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete payment (pending only)' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.paymentsService.softDelete(id, req.user.id);
    return { message: 'Payment deleted successfully' };
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted payment' })
  async restore(@Param('id') id: string) {
    return this.paymentsService.restore(id);
  }
}
