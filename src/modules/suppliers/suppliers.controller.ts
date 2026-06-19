import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier, SupplierType } from './entities/supplier.entity';

@ApiTags('Suppliers')
@Controller('api/v1/suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully', type: Supplier })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suppliers with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'supplier_type', required: false, enum: SupplierType })
  @ApiQuery({ name: 'is_approved', required: false, type: Boolean })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('supplier_type') supplierType?: SupplierType,
    @Query('is_approved') isApproved?: boolean,
    @Query('is_active') isActive?: boolean,
  ): Promise<{ data: Supplier[]; total: number }> {
    return this.suppliersService.findAll(page, limit, supplierType, isApproved, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier found', type: Supplier })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async findById(@Param('id') id: string): Promise<Supplier> {
    return this.suppliersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully', type: Supplier })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve supplier' })
  @ApiResponse({ status: 200, description: 'Supplier approved successfully', type: Supplier })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Supplier> {
    return this.suppliersService.approve(id, user.email);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete supplier' })
  @ApiResponse({ status: 200, description: 'Supplier deleted successfully', type: Supplier })
  @ApiResponse({ status: 404, description: 'Supplier not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Supplier> {
    return this.suppliersService.remove(id, user.email);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted supplier' })
  @ApiResponse({ status: 200, description: 'Supplier restored successfully', type: Supplier })
  @ApiResponse({ status: 404, description: 'Deleted supplier not found' })
  async restore(@Param('id') id: string): Promise<Supplier> {
    return this.suppliersService.restore(id);
  }
}
