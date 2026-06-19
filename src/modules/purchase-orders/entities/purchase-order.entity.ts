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
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum POStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}

export enum POPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('purchase_orders')
@Index(['po_number'], { unique: true })
@Index(['supplier_id'])
@Index(['vessel_id'])
@Index(['status'])
@Index(['created_at'])
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  po_number: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'uuid', nullable: true })
  vessel_id: string | null;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: POStatus,
    default: POStatus.DRAFT,
  })
  status: POStatus;

  @Column({
    type: 'enum',
    enum: POPriority,
    default: POPriority.NORMAL,
  })
  priority: POPriority;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_delivery_date: Date | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

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
  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Vessel, { eager: true, nullable: true })
  @JoinColumn({ name: 'vessel_id' })
  vessel: Vessel | null;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchase_order, {
    eager: true,
    cascade: true,
  })
  items: PurchaseOrderItem[];
}
