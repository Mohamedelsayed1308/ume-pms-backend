import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { VesselsModule } from './modules/vessels/vessels.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    SuppliersModule,
    VesselsModule,
    PurchaseOrdersModule,
    InvoicesModule,
    PaymentsModule,
    BankAccountsModule,
    ExchangeRatesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
