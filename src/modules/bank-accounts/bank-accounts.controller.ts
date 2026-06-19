import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import { BankAccount } from './entities/bank-account.entity';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created successfully', type: BankAccountResponseDto })
  async create(@Body() createBankAccountDto: CreateBankAccountDto, @Request() req): Promise<BankAccount> {
    return this.bankAccountsService.create(createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all bank accounts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'List of bank accounts', type: [BankAccountResponseDto] })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: BankAccount[]; total: number }> {
    return this.bankAccountsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank account by ID' })
  @ApiResponse({ status: 200, description: 'Bank account details', type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async findById(@Param('id') id: string): Promise<BankAccount> {
    return this.bankAccountsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    return this.bankAccountsService.update(id, updateBankAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a bank account' })
  @ApiResponse({ status: 204, description: 'Bank account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Bank account not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    const deletedBy = req.user?.email || req.user?.id || 'system';
    await this.bankAccountsService.softDelete(id, deletedBy);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a deleted bank account' })
  @ApiResponse({ status: 200, description: 'Bank account restored successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 404, description: 'Deleted bank account not found' })
  async restore(@Param('id') id: string): Promise<BankAccount> {
    return this.bankAccountsService.restore(id);
  }
}
