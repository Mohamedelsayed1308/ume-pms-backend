import { Exclude } from 'class-transformer';
import { InvoiceStatus, InvoiceCurrency } from '../entities/invoice.entity';

export class InvoiceItemResponseDto {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export class InvoiceResponseDto {
  id: string;
  invoice_number: string;
  po_id: string | null;
  supplier_id: string;
  vessel_id: string | null;
  invoice_date: Date;
  due_date: Date;
  status: InvoiceStatus;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  currency: InvoiceCurrency;
  exchange_rate: number;
  notes: string | null;
  approved_by: string | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  items: InvoiceItemResponseDto[];
  created_at: Date;
  updated_at: Date;

  @Exclude()
  is_deleted: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  deleted_by: string | null;
}
