import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto, ApproveInvoiceDto, RejectInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly itemRepository: Repository<InvoiceItem>,
  ) {}

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.invoice_number LIKE :pattern', { pattern: `INV-${year}-%` })
      .orderBy('inv.invoice_number', 'DESC')
      .limit(1)
      .getOne();

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoice_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `INV-${year}-${String(sequence).padStart(4, '0')}`;
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice_number = await this.generateInvoiceNumber();

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      invoice_number,
      total_amount: 0,
      paid_amount: 0,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create items and calculate total
    let totalAmount = 0;
    const items = [];

    for (const itemDto of createInvoiceDto.items) {
      const item = this.itemRepository.create({
        invoice_id: savedInvoice.id,
        ...itemDto,
      });
      items.push(item);
      totalAmount += Number(itemDto.quantity) * Number(itemDto.unit_price);
    }

    await this.itemRepository.save(items);

    // Update invoice with total amount
    savedInvoice.total_amount = totalAmount;
    savedInvoice.items = items;
    await this.invoiceRepository.save(savedInvoice);

    return savedInvoice;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: InvoiceStatus,
    supplier_id?: string,
    vessel_id?: string,
    po_id?: string,
  ): Promise<{ data: Invoice[]; total: number }> {
    const query = this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('inv.items', 'items')
      .leftJoinAndSelect('inv.supplier', 'supplier')
      .leftJoinAndSelect('inv.vessel', 'vessel')
      .leftJoinAndSelect('inv.purchase_order', 'po');

    if (status) {
      query.andWhere('inv.status = :status', { status });
    }

    if (supplier_id) {
      query.andWhere('inv.supplier_id = :supplier_id', { supplier_id });
    }

    if (vessel_id) {
      query.andWhere('inv.vessel_id = :vessel_id', { vessel_id });
    }

    if (po_id) {
      query.andWhere('inv.po_id = :po_id', { po_id });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('inv.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.id = :id', { id })
      .andWhere('inv.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('inv.items', 'items')
      .leftJoinAndSelect('inv.supplier', 'supplier')
      .leftJoinAndSelect('inv.vessel', 'vessel')
      .leftJoinAndSelect('inv.purchase_order', 'po')
      .getOne();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be updated');
    }

    // Update basic fields
    Object.assign(invoice, updateInvoiceDto);

    // If items are provided, update them
    if (updateInvoiceDto.items) {
      // Delete existing items
      await this.itemRepository.delete({ invoice_id: id });

      // Create new items
      let totalAmount = 0;
      const items = [];

      for (const itemDto of updateInvoiceDto.items) {
        const item = this.itemRepository.create({
          invoice_id: id,
          ...itemDto,
        });
        items.push(item);
        totalAmount += Number(itemDto.quantity) * Number(itemDto.unit_price);
      }

      await this.itemRepository.save(items);
      invoice.total_amount = totalAmount;
      invoice.items = items;
    }

    return await this.invoiceRepository.save(invoice);
  }

  async submit(id: string): Promise<Invoice> {
    const invoice = await this.findById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be submitted');
    }

    if (!invoice.items || invoice.items.length === 0) {
      throw new BadRequestException('Invoice must have at least one item');
    }

    invoice.status = InvoiceStatus.PENDING_APPROVAL;
    return await this.invoiceRepository.save(invoice);
  }

  async approve(id: string, approveInvoiceDto: ApproveInvoiceDto): Promise<Invoice> {
    const invoice = await this.findById(id);

    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval invoices can be approved');
    }

    invoice.status = InvoiceStatus.APPROVED;
    invoice.approved_by = approveInvoiceDto.approved_by;
    invoice.approved_at = new Date();

    return await this.invoiceRepository.save(invoice);
  }

  async reject(id: string, rejectInvoiceDto: RejectInvoiceDto): Promise<Invoice> {
    const invoice = await this.findById(id);

    if (invoice.status !== InvoiceStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval invoices can be rejected');
    }

    invoice.status = InvoiceStatus.REJECTED;
    invoice.rejection_reason = rejectInvoiceDto.rejection_reason;

    return await this.invoiceRepository.save(invoice);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const invoice = await this.findById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    invoice.is_deleted = true;
    invoice.deleted_at = new Date();
    invoice.deleted_by = deletedBy;

    await this.invoiceRepository.save(invoice);
  }

  async restore(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.id = :id', { id })
      .andWhere('inv.is_deleted = :isDeleted', { isDeleted: true })
      .leftJoinAndSelect('inv.items', 'items')
      .leftJoinAndSelect('inv.supplier', 'supplier')
      .leftJoinAndSelect('inv.vessel', 'vessel')
      .leftJoinAndSelect('inv.purchase_order', 'po')
      .getOne();

    if (!invoice) {
      throw new NotFoundException('Deleted invoice not found');
    }

    invoice.is_deleted = false;
    invoice.deleted_at = null;
    invoice.deleted_by = null;

    return await this.invoiceRepository.save(invoice);
  }
}
