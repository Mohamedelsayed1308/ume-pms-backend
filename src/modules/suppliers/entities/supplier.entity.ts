import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SupplierType {
  LOCAL = 'local',
  INTERNATIONAL = 'international',
}

export enum PaymentTerms {
  ADVANCE = 'advance',
  NET_30 = 'net_30',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('suppliers')
@Index(['code'], { unique: true })
@Index(['name'], { unique: true })
@Index(['is_deleted'])
@Index(['is_active'])
@Index(['is_approved'])
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'enum', enum: SupplierType })
  supplier_type: SupplierType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_person: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'enum', enum: PaymentTerms })
  payment_terms: PaymentTerms;

  @Column({ type: 'enum', enum: Currency })
  currency: Currency;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tax_registration_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bank_account_number: string;

  @Column({ type: 'varchar', length: 50, nullable: true, select: false })
  iban: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit_limit: number;

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
