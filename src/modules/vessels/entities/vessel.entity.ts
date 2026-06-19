import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('vessels')
@Index(['name'], { unique: true })
@Index(['imo_number'], { unique: true })
@Index(['is_deleted'])
@Index(['is_active'])
export class Vessel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  imo_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vessel_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  flag_state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  port_of_registry: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  gross_tonnage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  net_tonnage: number;

  @Column({ type: 'int', nullable: true })
  year_built: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deleted_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
