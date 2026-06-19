import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto, CompletePaymentDto, CancelPaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastPayment = await this.paymentRepository
      .createQueryBuilder('pay')
      .where('pay.payment_number LIKE :pattern', { pattern: `PAY-${year}-%` })
      .orderBy('pay.payment_number', 'DESC')
      .limit(1)
      .getOne();

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.payment_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `PAY-${year}-${String(sequence).padStart(4, '0')}`;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Verify invoice exists
    const invoice = await this.invoiceRepository.findOne({
      where: { id: createPaymentDto.invoice_id, is_deleted: false },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const payment_number = await this.generatePaymentNumber();

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      payment_number,
      status: PaymentStatus.PENDING,
    });

    return await this.paymentRepository.save(payment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: PaymentStatus,
    supplier_id?: string,
    invoice_id?: string,
  ): Promise<{ data: Payment[]; total: number }> {
    const query = this.paymentRepository
      .createQueryBuilder('pay')
      .where('pay.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('pay.invoice', 'invoice')
      .leftJoinAndSelect('pay.supplier', 'supplier');

    if (status) {
      query.andWhere('pay.status = :status', { status });
    }

    if (supplier_id) {
      query.andWhere('pay.supplier_id = :supplier_id', { supplier_id });
    }

    if (invoice_id) {
      query.andWhere('pay.invoice_id = :invoice_id', { invoice_id });
    }

    const total = await query.getCount();
    const data = await query
      .orderBy('pay.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total };
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('pay')
      .where('pay.id = :id', { id })
      .andWhere('pay.is_deleted = :isDeleted', { isDeleted: false })
      .leftJoinAndSelect('pay.invoice', 'invoice')
      .leftJoinAndSelect('pay.supplier', 'supplier')
      .getOne();

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be updated');
    }

    Object.assign(payment, updatePaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async complete(id: string, completePaymentDto: CompletePaymentDto): Promise<Payment> {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be completed');
    }

    // Get the invoice with items
    const invoice = await this.invoiceRepository
      .createQueryBuilder('inv')
      .where('inv.id = :id', { id: payment.invoice_id })
      .leftJoinAndSelect('inv.items', 'items')
      .getOne();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Update payment
    payment.status = PaymentStatus.COMPLETED;
    payment.approved_by = completePaymentDto.approved_by;
    payment.approved_at = new Date();
    await this.paymentRepository.save(payment);

    // Update invoice paid_amount
    const newPaidAmount = Number(invoice.paid_amount) + Number(payment.amount);
    invoice.paid_amount = newPaidAmount;

    // Update invoice status based on paid amount
    if (newPaidAmount >= invoice.total_amount) {
      invoice.status = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepository.save(invoice);

    return payment;
  }

  async cancel(id: string, cancelPaymentDto: CancelPaymentDto): Promise<Payment> {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    payment.status = PaymentStatus.CANCELLED;
    return await this.paymentRepository.save(payment);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const payment = await this.findById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be deleted');
    }

    payment.is_deleted = true;
    payment.deleted_at = new Date();
    payment.deleted_by = deletedBy;

    await this.paymentRepository.save(payment);
  }

  async restore(id: string): Promise<Payment> {
    const payment = await this.paymentRepository
      .createQueryBuilder('pay')
      .where('pay.id = :id', { id })
      .andWhere('pay.is_deleted = :isDeleted', { isDeleted: true })
      .leftJoinAndSelect('pay.invoice', 'invoice')
      .leftJoinAndSelect('pay.supplier', 'supplier')
      .getOne();

    if (!payment) {
      throw new NotFoundException('Deleted payment not found');
    }

    payment.is_deleted = false;
    payment.deleted_at = null;
    payment.deleted_by = null;

    return await this.paymentRepository.save(payment);
  }
}
