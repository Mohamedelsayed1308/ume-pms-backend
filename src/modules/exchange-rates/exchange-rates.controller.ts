import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRateResponseDto } from './dto/exchange-rate-response.dto';
import { ExchangeRate } from './entities/exchange-rate.entity';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new exchange rate' })
  @ApiResponse({ status: 201, description: 'Exchange rate created successfully', type: ExchangeRateResponseDto })
  async create(@Body() createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    return this.exchangeRatesService.create(createExchangeRateDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all exchange rates with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of exchange rates', type: [ExchangeRateResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: ExchangeRate[]; total: number }> {
    return this.exchangeRatesService.findAll(page, limit);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest exchange rate for each currency pair' })
  @ApiResponse({ status: 200, description: 'Latest exchange rates', type: [ExchangeRateResponseDto] })
  async findLatest(): Promise<ExchangeRate[]> {
    return this.exchangeRatesService.findLatest();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exchange rate by ID' })
  @ApiResponse({ status: 200, description: 'Exchange rate details', type: ExchangeRateResponseDto })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  async findById(@Param('id') id: string): Promise<ExchangeRate> {
    return this.exchangeRatesService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exchange rate' })
  @ApiResponse({ status: 200, description: 'Exchange rate updated successfully', type: ExchangeRateResponseDto })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  async update(
    @Param('id') id: string,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
  ): Promise<ExchangeRate> {
    return this.exchangeRatesService.update(id, updateExchangeRateDto);
  }
}
