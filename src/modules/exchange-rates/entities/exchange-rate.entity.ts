import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ExchangeRateCurrency {
  USD = 'USD',
  EUR = 'EUR',
  AED = 'AED',
  EGP = 'EGP',
}

@Entity('exchange_rates')
@Index(['from_currency', 'to_currency', 'effective_date'], { unique: true })
@Index(['from_currency'])
@Index(['to_currency'])
@Index(['effective_date'])
@Index(['created_at'])
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ExchangeRateCurrency,
  })
  from_currency: ExchangeRateCurrency;

  @Column({
    type: 'enum',
    enum: ExchangeRateCurrency,
  })
  to_currency: ExchangeRateCurrency;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 4,
  })
  rate: number;

  @Column({ type: 'date' })
  effective_date: Date;

  @Column({ type: 'varchar', nullable: true })
  created_by: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
