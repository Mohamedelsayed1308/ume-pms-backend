import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier, SupplierType } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * Generate unique supplier code
   * Format: SUP-YYYY-0001
   */
  private async generateSupplierCode(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.supplierRepository.count();
    return `SUP-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Create a new supplier
   */
  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    try {
      const code = await this.generateSupplierCode();

      const supplier = this.supplierRepository.create({
        ...createSupplierDto,
        code,
      });

      const savedSupplier = await this.supplierRepository.save(supplier);
      this.logger.log(`Supplier created: ${savedSupplier.id} - ${savedSupplier.name}`);
      return savedSupplier;
    } catch (error) {
      this.logger.error(`Error creating supplier: ${error.message}`);
      if (error.code === '23505') {
        throw new BadRequestException('Supplier name already exists');
      }
      throw error;
    }
  }

  /**
   * Get all suppliers with pagination and filters
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    supplierType?: SupplierType,
    isApproved?: boolean,
    isActive?: boolean,
  ): Promise<{ data: Supplier[]; total: number }> {
    const query = this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.is_deleted = :isDeleted', { isDeleted: false });

    if (supplierType) {
      query.andWhere('supplier.supplier_type = :supplierType', { supplierType });
    }

    if (isApproved !== undefined) {
      query.andWhere('supplier.is_approved = :isApproved', { isApproved });
    }

    if (isActive !== undefined) {
      query.andWhere('supplier.is_active = :isActive', { isActive });
    }

    const total = await query.getCount();
    const skip = (page - 1) * limit;

    const data = await query
      .orderBy('supplier.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    return { data, total };
  }

  /**
   * Get supplier by ID
   */
  async findById(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  /**
   * Get supplier by code
   */
  async findByCode(code: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { code, is_deleted: false },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with code ${code} not found`);
    }

    return supplier;
  }

  /**
   * Update supplier
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findById(id);

    Object.assign(supplier, updateSupplierDto);
    const updatedSupplier = await this.supplierRepository.save(supplier);

    this.logger.log(`Supplier updated: ${id}`);
    return updatedSupplier;
  }

  /**
   * Approve supplier
   */
  async approve(id: string, approvedBy: string): Promise<Supplier> {
    const supplier = await this.findById(id);

    supplier.is_approved = true;
    supplier.approved_by = approvedBy;
    supplier.approved_at = new Date();

    const approvedSupplier = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier approved: ${id}`);
    return approvedSupplier;
  }

  /**
   * Soft delete supplier
   */
  async remove(id: string, deletedBy: string): Promise<Supplier> {
    const supplier = await this.findById(id);

    supplier.is_deleted = true;
    supplier.deleted_at = new Date();
    supplier.deleted_by = deletedBy;

    const deletedSupplier = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier soft deleted: ${id}`);
    return deletedSupplier;
  }

  /**
   * Restore soft-deleted supplier
   */
  async restore(id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, is_deleted: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Deleted supplier with ID ${id} not found`);
    }

    supplier.is_deleted = false;
    supplier.deleted_at = null;
    supplier.deleted_by = null;

    const restoredSupplier = await this.supplierRepository.save(supplier);
    this.logger.log(`Supplier restored: ${id}`);
    return restoredSupplier;
  }
}
