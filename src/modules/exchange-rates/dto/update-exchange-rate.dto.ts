import { Type } from 'class-transformer';
import { IsOptional, IsDecimal, Min, IsDate } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  rate?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effective_date?: Date;
}

