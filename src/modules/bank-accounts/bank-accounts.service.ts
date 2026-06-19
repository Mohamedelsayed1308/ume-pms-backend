import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  async create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccount> {
    const existingAccount = await this.bankAccountRepository.findOne({
      where: { account_number: createBankAccountDto.account_number },
    });

    if (existingAccount) {
      throw new BadRequestException('Account number already exists');
    }

    const bankAccount = this.bankAccountRepository.create({
      ...createBankAccountDto,
      current_balance: createBankAccountDto.current_balance || createBankAccountDto.opening_balance || 0,
    });

    return await this.bankAccountRepository.save(bankAccount);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: BankAccount[]; total: number }> {
    const query = this.bankAccountRepository
      .createQueryBuilder('ba')
      .where('ba.is_deleted = :isDeleted', { isDeleted: false });

    const total = await query.getCount();
    const data = await query
      .orderBy('ba.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount;
  }

  async update(id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccount> {
    const bankAccount = await this.findById(id);

    Object.assign(bankAccount, updateBankAccountDto);
    return await this.bankAccountRepository.save(bankAccount);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const bankAccount = await this.findById(id);

    bankAccount.is_deleted = true;
    bankAccount.deleted_at = new Date();
    bankAccount.deleted_by = deletedBy;

    await this.bankAccountRepository.save(bankAccount);
  }

  async restore(id: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id, is_deleted: true },
    });

    if (!bankAccount) {
      throw new NotFoundException('Deleted bank account not found');
    }

    bankAccount.is_deleted = false;
    bankAccount.deleted_at = null;
    bankAccount.deleted_by = null;

    return await this.bankAccountRepository.save(bankAccount);
  }
}
