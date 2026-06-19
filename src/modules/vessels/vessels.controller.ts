import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VesselsService } from './vessels.service';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { UpdateVesselDto } from './dto/update-vessel.dto';
import { Vessel } from './entities/vessel.entity';

@ApiTags('Vessels')
@Controller('api/v1/vessels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, description: 'Vessel created successfully', type: Vessel })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() createVesselDto: CreateVesselDto): Promise<Vessel> {
    return this.vesselsService.create(createVesselDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vessels with pagination' })
  @ApiResponse({ status: 200, description: 'List of vessels' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Vessel[]; total: number }> {
    return this.vesselsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vessel by ID' })
  @ApiResponse({ status: 200, description: 'Vessel found', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async findById(@Param('id') id: string): Promise<Vessel> {
    return this.vesselsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update vessel' })
  @ApiResponse({ status: 200, description: 'Vessel updated successfully', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVesselDto: UpdateVesselDto,
  ): Promise<Vessel> {
    return this.vesselsService.update(id, updateVesselDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete vessel' })
  @ApiResponse({ status: 200, description: 'Vessel deleted successfully', type: Vessel })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<Vessel> {
    return this.vesselsService.remove(id, user.email);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft-deleted vessel' })
  @ApiResponse({ status: 200, description: 'Vessel restored successfully', type: Vessel })
  @ApiResponse({ status: 404, description: 'Deleted vessel not found' })
  async restore(@Param('id') id: string): Promise<Vessel> {
    return this.vesselsService.restore(id);
  }
}
