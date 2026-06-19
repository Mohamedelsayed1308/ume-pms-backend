import { Exclude } from 'class-transformer';
import { BankAccountCurrency } from '../entities/bank-account.entity';

export class BankAccountResponseDto {
  id: string;
  account_name: string;
  account_number: string;
  iban: string | null;
  swift_code: string | null;
  bank_name: string;
  branch: string | null;
  currency: BankAccountCurrency;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  @Exclude()
  is_deleted: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  deleted_by: string | null;
}
