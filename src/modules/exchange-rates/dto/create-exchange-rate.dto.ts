import { Type } from 'class-transformer';
import { IsEnum, IsDecimal, Min, IsDate, IsOptional, IsString } from 'class-validator';
import { ExchangeRateCurrency } from '../entities/exchange-rate.entity';

export class CreateExchangeRateDto {
  @IsEnum(ExchangeRateCurrency)
  from_currency: ExchangeRateCurrency;

  @IsEnum(ExchangeRateCurrency)
  to_currency: ExchangeRateCurrency;

  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  rate: number;

  @IsDate()
  @Type(() => Date)
  effective_date: Date;

  @IsOptional()
  @IsString()
  created_by?: string;
}

