import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PaymentCurrency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('payments')
@Index(['payment_number'], { unique: true })
@Index(['invoice_id'])
@Index(['supplier_id'])
@Index(['status'])
@Index(['payment_date'])
@Index(['created_at'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  payment_number: string;

  @Column({ type: 'uuid' })
  invoice_id: string;

  @Column({ type: 'uuid' })
  supplier_id: string;

  @Column({ type: 'date' })
  payment_date: Date;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentCurrency,
    default: PaymentCurrency.USD,
  })
  currency: PaymentCurrency;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
    default: 1,
  })
  exchange_rate: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  bank_account_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  reference_number: string | null;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true })
  approved_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

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
  @ManyToOne(() => Invoice, { eager: true })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;
}
