import { IsString, IsNumber, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVesselDto {
  @ApiProperty({ example: 'Posiedon Express', description: 'Vessel name' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ example: '9123456', description: 'IMO number' })
  @IsString()
  @MinLength(7)
  imo_number: string;

  @ApiProperty({ example: 'RORO', required: false })
  @IsOptional()
  @IsString()
  vessel_type?: string;

  @ApiProperty({ example: 'Panama', required: false })
  @IsOptional()
  @IsString()
  flag_state?: string;

  @ApiProperty({ example: 'Dubai', required: false })
  @IsOptional()
  @IsString()
  port_of_registry?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  gross_tonnage?: number;

  @ApiProperty({ example: 40000, required: false })
  @IsOptional()
  @IsNumber()
  net_tonnage?: number;

  @ApiProperty({ example: 2015, required: false })
  @IsOptional()
  @IsNumber()
  year_built?: number;
}
