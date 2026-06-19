import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Vessel } from '../vessels/entities/vessel.entity';
import { PurchaseOrder, POStatus } from '../purchase-orders/entities/purchase-order.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Vessel)
    private readonly vesselRepository: Repository<Vessel>,
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    // Count total suppliers (not deleted)
    const total_suppliers = await this.supplierRepository.count({
      where: { is_deleted: false },
    });

    // Count total vessels (not deleted)
    const total_vessels = await this.vesselRepository.count({
      where: { is_deleted: false },
    });

    // Count total purchase orders (not deleted)
    const total_purchase_orders = await this.purchaseOrderRepository.count({
      where: { is_deleted: false },
    });

    // Count total invoices (not deleted)
    const total_invoices = await this.invoiceRepository.count({
      where: { is_deleted: false },
    });

    // Count completed payments (not deleted)
    const total_payments_completed = await this.paymentRepository.count({
      where: {
        status: PaymentStatus.COMPLETED,
        is_deleted: false,
      },
    });

    // Count pending approvals (POs pending approval + Invoices pending approval)
    const pending_po_approvals = await this.purchaseOrderRepository.count({
      where: {
        status: POStatus.PENDING_APPROVAL,
        is_deleted: false,
      },
    });

    const pending_invoice_approvals = await this.invoiceRepository.count({
      where: {
        status: InvoiceStatus.PENDING_APPROVAL,
        is_deleted: false,
      },
    });

    const pending_approvals = pending_po_approvals + pending_invoice_approvals;

    return {
      total_suppliers,
      total_vessels,
      total_purchase_orders,
      total_invoices,
      total_payments_completed,
      pending_approvals,
    };
  }
}
