import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { Vessel } from '../../vessels/entities/vessel.entity';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled',
}

export enum InvoiceCurrency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('invoices')
@Index(['invoice_number'], { unique: true })
@Index(['supplier_id'])
@Index(['vessel_id'])
@Index(['po_id'])
@Index(['status'])
@Index(['due_date'])
@Index(['created_at'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  invoice_number: string;

  @Column({ type: 'uuid', nullable: true })
  po_id: string | null;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'uuid', nullable: true })
  vessel_id: string | null;

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  total_amount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  remaining_amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceCurrency,
    default: InvoiceCurrency.USD,
  })
  currency: InvoiceCurrency;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 1,
  })
  exchange_rate: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true })
  approved_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string | null;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @Column({ type: 'varchar', nullable: true })
  deleted_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => PurchaseOrder, { eager: true, nullable: true })
  @JoinColumn({ name: 'po_id' })
  purchase_order: PurchaseOrder | null;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Vessel, { eager: true, nullable: true })
  @JoinColumn({ name: 'vessel_id' })
  vessel: Vessel | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    eager: true,
    cascade: true,
  })
  items: InvoiceItem[];
}

