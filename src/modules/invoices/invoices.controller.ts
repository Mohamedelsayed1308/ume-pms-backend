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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, ApproveInvoiceDto, RejectInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new invoice with items' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully', type: InvoiceResponseDto })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all invoices with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'supplier_id', required: false, type: String, description: 'Filter by supplier ID' })
  @ApiQuery({ name: 'vessel_id', required: false, type: String, description: 'Filter by vessel ID' })
  @ApiQuery({ name: 'po_id', required: false, type: String, description: 'Filter by purchase order ID' })
  @ApiResponse({ status: 200, description: 'List of invoices', type: [InvoiceResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: InvoiceStatus,
    @Query('supplier_id') supplier_id?: string,
    @Query('vessel_id') vessel_id?: string,
    @Query('po_id') po_id?: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    return this.invoicesService.findAll(page, limit, status, supplier_id, vessel_id, po_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID with items, supplier, and PO details' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findById(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice (only if status is draft)' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be updated' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit an invoice for approval (change status from draft to pending_approval)' })
  @ApiResponse({ status: 200, description: 'Invoice submitted successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be submitted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async submit(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve an invoice (set status to approved)' })
  @ApiResponse({ status: 200, description: 'Invoice approved successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending approval invoices can be approved' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveInvoiceDto: ApproveInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.approve(id, approveInvoiceDto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an invoice (set status to rejected)' })
  @ApiResponse({ status: 200, description: 'Invoice rejected successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Only pending approval invoices can be rejected' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async reject(
    @Param('id') id: string,
    @Body() rejectInvoiceDto: RejectInvoiceDto,
  ): Promise<Invoice> {
    return this.invoicesService.reject(id, rejectInvoiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete an invoice (only if status is draft)' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be deleted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    const deletedBy = req.user?.email || req.user?.id || 'system';
    await this.invoicesService.softDelete(id, deletedBy);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a deleted invoice' })
  @ApiResponse({ status: 200, description: 'Invoice restored successfully', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Deleted invoice not found' })
  async restore(@Param('id') id: string): Promise<Invoice> {
    return this.invoicesService.restore(id);
  }
}
