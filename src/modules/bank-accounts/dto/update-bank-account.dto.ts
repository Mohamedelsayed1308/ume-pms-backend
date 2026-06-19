import { IsOptional, IsString, IsEnum, IsDecimal, Min, IsBoolean } from 'class-validator';
import { BankAccountCurrency } from '../entities/bank-account.entity';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  account_name?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  swift_code?: string;

  @IsOptional()
  @IsString()
  bank_name?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsEnum(BankAccountCurrency)
  currency?: BankAccountCurrency;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0)
  current_balance?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
