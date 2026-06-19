import {
  Controller, Post, Get, Put, Body, Param,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@ApiTags('Exchange Rates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exchange rate' })
  @ApiResponse({ status: 201, description: 'Exchange rate created successfully' })
  async create(@Body() dto: CreateExchangeRateDto) {
    return this.exchangeRatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all exchange rates' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.exchangeRatesService.findAll(+page, +limit);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest exchange rate for each currency pair' })
  async findLatest() {
    return this.exchangeRatesService.findLatest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exchange rate by ID' })
  async findById(@Param('id') id: string) {
    return this.exchangeRatesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update exchange rate' })
  async update(@Param('id') id: string, @Body() dto: UpdateExchangeRateDto) {
    return this.exchangeRatesService.update(id, dto);
  }
}
