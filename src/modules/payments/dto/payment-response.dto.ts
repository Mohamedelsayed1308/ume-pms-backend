import { Exclude } from 'class-transformer';
import { PaymentStatus, PaymentMethod, PaymentCurrency } from '../entities/payment.entity';

export class PaymentResponseDto {
  id: string;
  payment_number: string;
  invoice_id: string;
  supplier_id: string;
  payment_date: Date;
  amount: number;
  currency: PaymentCurrency;
  exchange_rate: number;
  payment_method: PaymentMethod;
  bank_account_id: string | null;
  reference_number: string | null;
  status: PaymentStatus;
  notes: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;

  @Exclude()
  is_deleted: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  deleted_by: string | null;
}
