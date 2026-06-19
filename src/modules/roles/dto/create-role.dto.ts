import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Finance Manager', description: 'Role name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Manages financial operations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'], description: 'Permission IDs to assign' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}
