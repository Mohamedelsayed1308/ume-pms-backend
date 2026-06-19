import { Type } from 'class-transformer';
import { IsUUID, IsString, IsOptional, IsDate, IsEnum, IsArray, ValidateNested, IsDecimal, Min } from 'class-validator';
import { InvoiceCurrency } from '../entities/invoice.entity';

export class CreateInvoiceItemDto {
  @IsString()
  description: string;

  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  quantity: number;

  @IsDecimal({ decimal_digits: '1,2' })
  @Min(0.01)
  unit_price: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateInvoiceDto {
  @IsUUID()
  supplier_id: string;

  @IsOptional()
  @IsUUID()
  po_id?: string;

  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @IsDate()
  @Type(() => Date)
  invoice_date: Date;

  @IsDate()
  @Type(() => Date)
  due_date: Date;

  @IsEnum(InvoiceCurrency)
  currency: InvoiceCurrency = InvoiceCurrency.USD;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  exchange_rate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

