import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRate, ExchangeRateCurrency } from './entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectRepository(ExchangeRate)
    private readonly exchangeRateRepository: Repository<ExchangeRate>,
  ) {}

  async create(createExchangeRateDto: CreateExchangeRateDto): Promise<ExchangeRate> {
    if (createExchangeRateDto.from_currency === createExchangeRateDto.to_currency) {
      throw new BadRequestException('From currency and to currency cannot be the same');
    }

    const existingRate = await this.exchangeRateRepository.findOne({
      where: {
        from_currency: createExchangeRateDto.from_currency,
        to_currency: createExchangeRateDto.to_currency,
        effective_date: createExchangeRateDto.effective_date,
      },
    });

    if (existingRate) {
      throw new BadRequestException('Exchange rate for this currency pair and date already exists');
    }

    const exchangeRate = this.exchangeRateRepository.create(createExchangeRateDto);
    return await this.exchangeRateRepository.save(exchangeRate);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ExchangeRate[]; total: number }> {
    const query = this.exchangeRateRepository.createQueryBuilder('er');

    const total = await query.getCount();
    const data = await query
      .orderBy('er.effective_date', 'DESC')
      .addOrderBy('er.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findLatest(): Promise<ExchangeRate[]> {
    // Get the latest rate for each currency pair
    const query = this.exchangeRateRepository
      .createQueryBuilder('er')
      .distinctOn(['er.from_currency', 'er.to_currency'])
      .orderBy('er.from_currency', 'ASC')
      .addOrderBy('er.to_currency', 'ASC')
      .addOrderBy('er.effective_date', 'DESC')
      .addOrderBy('er.created_at', 'DESC');

    return await query.getMany();
  }

  async findById(id: string): Promise<ExchangeRate> {
    const exchangeRate = await this.exchangeRateRepository.findOne({
      where: { id },
    });

    if (!exchangeRate) {
      throw new NotFoundException('Exchange rate not found');
    }

    return exchangeRate;
  }

  async update(id: string, updateExchangeRateDto: UpdateExchangeRateDto): Promise<ExchangeRate> {
    const exchangeRate = await this.findById(id);

    Object.assign(exchangeRate, updateExchangeRateDto);
    return await this.exchangeRateRepository.save(exchangeRate);
  }

  async getRate(fromCurrency: ExchangeRateCurrency, toCurrency: ExchangeRateCurrency): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const rate = await this.exchangeRateRepository
      .createQueryBuilder('er')
      .where('er.from_currency = :from', { from: fromCurrency })
      .andWhere('er.to_currency = :to', { to: toCurrency })
      .orderBy('er.effective_date', 'DESC')
      .limit(1)
      .getOne();

    if (!rate) {
      throw new NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    return Number(rate.rate);
  }
}
