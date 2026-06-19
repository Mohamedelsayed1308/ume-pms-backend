import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Vessel } from '../vessels/entities/vessel.entity';
import { PurchaseOrder } from '../purchase-orders/entities/purchase-order.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Vessel, PurchaseOrder, Invoice, Payment])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
