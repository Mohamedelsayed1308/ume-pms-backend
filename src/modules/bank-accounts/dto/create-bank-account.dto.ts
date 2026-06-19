import { IsString, IsOptional, IsEnum, IsDecimal, Min } from 'class-validator';
import { BankAccountCurrency } from '../entities/bank-account.entity';

export class CreateBankAccountDto {
  @IsString()
  account_name: string;

  @IsString()
  account_number: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  swift_code?: string;

  @IsString()
  bank_name: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsEnum(BankAccountCurrency)
  currency: BankAccountCurrency;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  opening_balance?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  current_balance?: number;
}
