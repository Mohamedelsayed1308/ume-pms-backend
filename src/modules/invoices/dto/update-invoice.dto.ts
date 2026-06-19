import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate, IsEnum, IsArray, ValidateNested, IsDecimal, Min, IsUUID } from 'class-validator';
import { InvoiceCurrency } from '../entities/invoice.entity';
import { CreateInvoiceItemDto } from './create-invoice.dto';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsUUID()
  po_id?: string;

  @IsOptional()
  @IsUUID()
  vessel_id?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  invoice_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  due_date?: Date;

  @IsOptional()
  @IsEnum(InvoiceCurrency)
  currency?: InvoiceCurrency;

  @IsOptional()
  @IsDecimal({ decimal_digits: '1,4' })
  @Min(0.0001)
  exchange_rate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}

export class ApproveInvoiceDto {
  @IsString()
  approved_by: string;
}

export class RejectInvoiceDto {
  @IsString()
  rejection_reason: string;
}

