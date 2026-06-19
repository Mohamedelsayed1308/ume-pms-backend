import { Type } from 'class-transformer';
import { IsUUID, IsString, IsOptional, IsDate, IsEnum, IsArray, ValidateNested, IsDecimal, Min } from 'class-validator';
import { Currency, POPriority } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
  @IsString()
  item_description: string;

  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  quantity: number;

  @IsString()
  unit: string;

  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  unit_price: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  supplier_id: string;

  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDate()
  @Type(() => Date)
  order_date: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expected_delivery_date?: Date;

  @IsEnum(POPriority)
  priority: POPriority = POPriority.NORMAL;

  @IsEnum(Currency)
  currency: Currency = Currency.USD;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

