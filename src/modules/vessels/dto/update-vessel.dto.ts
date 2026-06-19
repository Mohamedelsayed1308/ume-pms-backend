import { PartialType } from '@nestjs/swagger';
import { CreateVesselDto } from './create-vessel.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVesselDto extends PartialType(CreateVesselDto) {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
