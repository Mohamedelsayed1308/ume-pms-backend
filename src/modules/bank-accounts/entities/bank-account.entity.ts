import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BankAccountCurrency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('bank_accounts')
@Index(['account_number'], { unique: true })
@Index(['is_active'])
@Index(['currency'])
@Index(['created_at'])
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  account_name: string;

  @Column({ type: 'varchar', unique: true })
  account_number: string;

  @Column({ type: 'varchar', nullable: true })
  iban: string | null;

  @Column({ type: 'varchar', nullable: true })
  swift_code: string | null;

  @Column({ type: 'varchar' })
  bank_name: string;

  @Column({ type: 'varchar', nullable: true })
  branch: string | null;

  @Column({
    type: 'enum',
    enum: BankAccountCurrency,
  })
  currency: BankAccountCurrency;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  opening_balance: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  current_balance: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

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
}
