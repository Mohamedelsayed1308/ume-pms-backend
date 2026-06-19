import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, POStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto, ApprovePurchaseOrderDto, RejectPurchaseOrderDto } from './dto/update-purchase-order.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private readonly itemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async generatePONumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastPO = await this.poRepository
      .createQueryBuilder('po')
      .where('po.po_number LIKE :pattern', { pattern: `PO-${year}-%` })
      .orderBy('po.po_number', 'DESC')
      .limit(1)
      .getOne();

    let sequence = 1;
    if (lastPO) {
      const lastSequence = parseInt(lastPO.po_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `PO-${year}-${String(sequence).padStart(4, '0')}`;
  }

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const po_number = await this.generatePONumber();

    const purchaseOrder = this.poRepository.create({
      ...createPurchaseOrderDto,
      po_number,
      total_amount: 0,
    });

    const savedPO = await this.poRepository.save(purchaseOrder);

    // Create items and calculate total
    let totalAmount = 0;
    const items = [];

    for (const itemDto of createPurchaseOrderDto.items) {
      const item = this.itemRepository.create({
        po_id: savedPO.id,
        ...itemDto,
      });
      items.push(item);
      totalAmount += Number(itemDto.quantity) * Number(itemDto.unit_price);
    }

    await this.itemRepository.save(items);

    // Update PO with total amount
    savedPO.total_amount = totalAmount;
    savedPO.items = items;
    await this.poRepository.save(savedPO);

    return savedPO;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: POStatus,
    supplier_id?: string,
    vessel_id?: string,
  ): Promise<{ data: PurchaseOrder[]; total: number }> {
    const query = this.poRepository
      .createQueryBuilder('po')
      .where('po.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.vessel', 'vessel');

    if (status) {
      query.andWhere('po.status = :status', { status });
    }

    if (supplier_id) {
      query.andWhere('po.supplier_id = :supplier_id', { supplier_id });
    }

    if (vessel_id) {
      query.andWhere('po.vessel_id = :vessel_id', { vessel_id });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('po.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.poRepository
      .createQueryBuilder('po')
      .where('po.id = :id', { id })
      .andWhere('po.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.vessel', 'vessel')
      .getOne();

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase Order not found');
    }

    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findById(id);

    if (purchaseOrder.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only draft POs can be updated');
    }

    // Update basic fields
    Object.assign(purchaseOrder, updatePurchaseOrderDto);

    // If items are provided, update them
    if (updatePurchaseOrderDto.items) {
      // Delete existing items
      await this.itemRepository.delete({ po_id: id });

      // Create new items
      let totalAmount = 0;
      const items = [];

      for (const itemDto of updatePurchaseOrderDto.items) {
        const item = this.itemRepository.create({
          po_id: id,
          ...itemDto,
        });
        items.push(item);
        totalAmount += Number(itemDto.quantity) * Number(itemDto.unit_price);
      }

      await this.itemRepository.save(items);
      purchaseOrder.total_amount = totalAmount;
      purchaseOrder.items = items;
    }

    return await this.poRepository.save(purchaseOrder);
  }

  async submit(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findById(id);

    if (purchaseOrder.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only draft POs can be submitted');
    }

    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      throw new BadRequestException('PO must have at least one item');
    }

    purchaseOrder.status = POStatus.PENDING_APPROVAL;
    return await this.poRepository.save(purchaseOrder);
  }

  async approve(id: string, approvePurchaseOrderDto: ApprovePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findById(id);

    if (purchaseOrder.status !== POStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval POs can be approved');
    }

    purchaseOrder.status = POStatus.APPROVED;
    purchaseOrder.approved_by = approvePurchaseOrderDto.approved_by;
    purchaseOrder.approved_at = new Date();

    return await this.poRepository.save(purchaseOrder);
  }

  async reject(id: string, rejectPurchaseOrderDto: RejectPurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findById(id);

    if (purchaseOrder.status !== POStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending approval POs can be rejected');
    }

    purchaseOrder.status = POStatus.REJECTED;
    purchaseOrder.rejection_reason = rejectPurchaseOrderDto.rejection_reason;

    return await this.poRepository.save(purchaseOrder);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const purchaseOrder = await this.findById(id);

    if (purchaseOrder.status !== POStatus.DRAFT) {
      throw new BadRequestException('Only draft POs can be deleted');
    }

    purchaseOrder.is_deleted = true;
    purchaseOrder.deleted_at = new Date();
    purchaseOrder.deleted_by = deletedBy;

    await this.poRepository.save(purchaseOrder);
  }

  async restore(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.poRepository
      .createQueryBuilder('po')
      .where('po.id = :id', { id })
      .andWhere('po.is_deleted = :isDeleted', { isDeleted: true })
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.vessel', 'vessel')
      .getOne();

    if (!purchaseOrder) {
      throw new NotFoundException('Deleted Purchase Order not found');
    }

    purchaseOrder.is_deleted = false;
    purchaseOrder.deleted_at = null;
    purchaseOrder.deleted_by = null;

    return await this.poRepository.save(purchaseOrder);
  }
}
