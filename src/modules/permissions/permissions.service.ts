import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionsRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionsRepository.create(dto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(skip = 0, take = 50): Promise<{ data: Permission[]; total: number }> {
    const [data, total] = await this.permissionsRepository.findAndCount({
      where: { is_deleted: false },
      skip,
      take,
      order: { resource: 'ASC', action: 'ASC' },
    });

    return { data, total };
  }

  async findById(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { id, is_deleted: false },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const permission = await this.findById(id);
    permission.is_deleted = true;
    permission.deleted_at = new Date();
    permission.deleted_by = deletedBy;
    await this.permissionsRepository.save(permission);
  }
}
