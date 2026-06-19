import { ExchangeRateCurrency } from '../entities/exchange-rate.entity';

export class ExchangeRateResponseDto {
  id: string;
  from_currency: ExchangeRateCurrency;
  to_currency: ExchangeRateCurrency;
  rate: number;
  effective_date: Date;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}
