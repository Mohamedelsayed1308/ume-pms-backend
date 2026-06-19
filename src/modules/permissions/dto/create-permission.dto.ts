import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'purchase_orders:create', description: 'Permission name (resource:action)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Can create purchase orders' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'purchase_orders', description: 'Resource this permission applies to' })
  @IsString()
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action: create, read, update, delete, approve' })
  @IsString()
  action: string;
}
