import { IsString, IsEmail, IsPhoneNumber, IsEnum, IsDecimal, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SupplierType, PaymentTerms, Currency } from '../entities/supplier.entity';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Fuel Supplier Inc.', description: 'Supplier name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ enum: SupplierType, example: SupplierType.INTERNATIONAL })
  @IsEnum(SupplierType)
  supplier_type: SupplierType;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  contact_person?: string;

  @ApiProperty({ example: 'john@supplier.com', required: false })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Dubai', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'UAE', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ enum: PaymentTerms, example: PaymentTerms.NET_30 })
  @IsEnum(PaymentTerms)
  payment_terms: PaymentTerms;

  @ApiProperty({ enum: Currency, example: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 'TAX123456', required: false })
  @IsOptional()
  @IsString()
  tax_registration_number?: string;

  @ApiProperty({ example: 'Emirates NBD', required: false })
  @IsOptional()
  @IsString()
  bank_name?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bank_account_number?: string;

  @ApiProperty({ example: 'AE070331234567890123456', required: false, description: 'IBAN' })
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiProperty({ example: 100000, required: false })
  @IsOptional()
  @IsDecimal()
  credit_limit?: number;
}
