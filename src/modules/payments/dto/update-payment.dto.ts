import { IsOptional, IsString, IsDate, IsEnum, IsDecimal, Min, Type, IsUUID } from 'class-validator';
import { PaymentMethod, PaymentCurrency } from '../entities/payment.entity';

export class UpdatePaymentDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  payment_date?: Date;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentCurrency)
  currency?: PaymentCurrency;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  exchange_rate?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

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

export class CompletePaymentDto {
  @IsString()
  approved_by: string;
}

export class CancelPaymentDto {
  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}
