import {
  Controller, Get, Post, Body, Param, Put, Delete,
  UseGuards, Request, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VesselsService } from './vessels.service';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { UpdateVesselDto } from './dto/update-vessel.dto';

@ApiTags('Vessels')
@Controller('api/v1/vessels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, description: 'Vessel created successfully' })
  async create(@Body() dto: CreateVesselDto) {
    return this.vesselsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vessels' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.vesselsService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vessel by ID' })
  async findById(@Param('id') id: string) {
    return this.vesselsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vessel' })
  async update(@Param('id') id: string, @Body() dto: UpdateVesselDto) {
    return this.vesselsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete vessel' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.vesselsService.remove(id, req.user.id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted vessel' })
  async restore(@Param('id') id: string) {
    return this.vesselsService.restore(id);
  }
}
