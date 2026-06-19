import { Exclude } from 'class-transformer';
import { POStatus, POPriority, Currency } from '../entities/purchase-order.entity';

export class PurchaseOrderItemResponseDto {
  id: string;
  item_description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export class PurchaseOrderResponseDto {
  id: string;
  po_number: string;
  supplier_id: string;
  vessel_id: string | null;
  title: string;
  description: string | null;
  status: POStatus;
  priority: POPriority;
  order_date: Date;
  expected_delivery_date: Date | null;
  total_amount: number;
  currency: Currency;
  approved_by: string | null;
  approved_at: Date | null;
  rejection_reason: string | null;
  items: PurchaseOrderItemResponseDto[];
  created_at: Date;
  updated_at: Date;

  @Exclude()
  is_deleted: boolean;

  @Exclude()
  deleted_at: Date | null;

  @Exclude()
  deleted_by: string | null;
}
