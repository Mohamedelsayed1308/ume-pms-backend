import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate, IsEnum, IsArray, ValidateNested, IsDecimal, Min } from 'class-validator';
import { Currency, POPriority } from '../entities/purchase-order.entity';
import { CreatePurchaseOrderItemDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  order_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expected_delivery_date?: Date;

  @IsOptional()
  @IsEnum(POPriority)
  priority?: POPriority;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items?: CreatePurchaseOrderItemDto[];
}

export class ApprovePurchaseOrderDto {
  @IsString()
  approved_by: string;
}

export class RejectPurchaseOrderDto {
  @IsString()
  rejection_reason: string;
}

