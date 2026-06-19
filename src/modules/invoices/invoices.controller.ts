import {
  Controller, Post, Get, Put, Delete, Body, Param,
  Query, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, ApproveInvoiceDto, RejectInvoiceDto } from './dto/update-invoice.dto';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'supplier_id', required: false, type: String })
  @ApiQuery({ name: 'vessel_id', required: false, type: String })
  @ApiQuery({ name: 'po_id', required: false, type: String })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
    @Query('supplier_id') supplier_id?: string,
    @Query('vessel_id') vessel_id?: string,
    @Query('po_id') po_id?: string,
  ) {
    return this.invoicesService.findAll(+page, +limit, status as any, supplier_id, vessel_id, po_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findById(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update invoice (draft only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit invoice for approval' })
  async submit(@Param('id') id: string) {
    return this.invoicesService.submit(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve invoice' })
  async approve(@Param('id') id: string, @Body() dto: ApproveInvoiceDto) {
    return this.invoicesService.approve(id, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject invoice' })
  async reject(@Param('id') id: string, @Body() dto: RejectInvoiceDto) {
    return this.invoicesService.reject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete invoice (draft only)' })
  async delete(@Param('id') id: string, @Request() req) {
    await this.invoicesService.softDelete(id, req.user.id);
    return { message: 'Invoice deleted successfully' };
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted invoice' })
  async restore(@Param('id') id: string) {
    return this.invoicesService.restore(id);
  }
}
