import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = this.rolesRepository.create(dto);

    if (dto.permission_ids?.length) {
      role.permissions = await this.permissionsRepository.find({
        where: { id: In(dto.permission_ids), is_deleted: false },
      });
    }

    return this.rolesRepository.save(role);
  }

  async findAll(skip = 0, take = 10): Promise<{ data: Role[]; total: number }> {
    const [data, total] = await this.rolesRepository.findAndCount({
      where: { is_deleted: false },
      relations: ['permissions'],
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async findById(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { name, is_deleted: false },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);

    if (dto.name && dto.name !== role.name) {
      const existing = await this.rolesRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    Object.assign(role, dto);

    if (dto.permission_ids !== undefined) {
      role.permissions = dto.permission_ids.length
        ? await this.permissionsRepository.find({
            where: { id: In(dto.permission_ids), is_deleted: false },
          })
        : [];
    }

    return this.rolesRepository.save(role);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const role = await this.findById(id);
    role.is_deleted = true;
    role.deleted_at = new Date();
    role.deleted_by = deletedBy;
    await this.rolesRepository.save(role);
  }

  async restore(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id, is_deleted: true } });
    if (!role) {
      throw new NotFoundException('Deleted role not found');
    }

    role.is_deleted = false;
    role.deleted_at = null;
    role.deleted_by = null;
    return this.rolesRepository.save(role);
  }
}
