import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { Supplier } from '../modules/suppliers/entities/supplier.entity';
import { Vessel } from '../modules/vessels/entities/vessel.entity';
import { PurchaseOrder } from '../modules/purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../modules/purchase-orders/entities/purchase-order-item.entity';
import { Invoice } from '../modules/invoices/entities/invoice.entity';
import { InvoiceItem } from '../modules/invoices/entities/invoice-item.entity';
import { Payment } from '../modules/payments/entities/payment.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'ume_pms',
  entities: [
    User,
    Role,
    Permission,
    Supplier,
    Vessel,
    PurchaseOrder,
    PurchaseOrderItem,
    Invoice,
    InvoiceItem,
    Payment,
  ],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
  keepConnectionAlive: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
