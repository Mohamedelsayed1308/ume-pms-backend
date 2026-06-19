import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(skip = 0, take = 10): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { is_deleted: false },
      relations: ['roles'],
      skip,
      take,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, is_deleted: false },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.email = :email', { email })
      .andWhere('user.is_deleted = false')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    if (dto.new_password !== dto.confirm_password) {
      throw new BadRequestException('New password and confirm password do not match');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.old_password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(dto.new_password, 10);
    await this.usersRepository.save(user);
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    const user = await this.findById(id);
    user.is_deleted = true;
    user.deleted_at = new Date();
    user.deleted_by = deletedBy;
    await this.usersRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id, is_deleted: true },
    });

    if (!user) {
      throw new NotFoundException('Deleted user not found');
    }

    user.is_deleted = false;
    user.deleted_at = null;
    user.deleted_by = null;
    return this.usersRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  async setPasswordResetToken(email: string, token: string, expiresInSeconds: number): Promise<void> {
    const user = await this.findByEmail(email);
    await this.usersRepository.update(user.id, {
      password_reset_token: token,
      password_reset_expires: new Date(Date.now() + expiresInSeconds * 1000),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_reset_token')
      .addSelect('user.password_reset_expires')
      .where('user.password_reset_token = :token', { token })
      .getOne();

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (user.password_reset_expires < new Date()) {
      throw new BadRequestException('Password reset token has expired');
    }

    await this.usersRepository.update(user.id, {
      password: await bcrypt.hash(newPassword, 10),
      password_reset_token: null,
      password_reset_expires: null,
    });
  }
}
