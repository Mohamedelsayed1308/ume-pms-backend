import { IsUUID, IsString, IsOptional, IsDate, IsEnum, IsDecimal, Min, Type } from 'class-validator';
import { PaymentMethod, PaymentCurrency } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  invoice_id: string;

  @IsUUID()
  supplier_id: string;

  @IsDate()
  @Type(() => Date)
  payment_date: Date;

  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentCurrency)
  currency: PaymentCurrency = PaymentCurrency.USD;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  exchange_rate?: number;

  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  bank_account_id?: string;

  @IsOptional()
  @IsString()
  reference_number?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
