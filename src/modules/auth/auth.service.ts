import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    let user;
    try {
      user = await this.usersService.findByEmail(dto.email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    await this.usersService.updateLastLogin(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.name) || [],
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: parseInt(process.env.JWT_EXPIRATION || '86400', 10),
    });

    const refresh_token = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10),
      },
    );

    const { password, password_reset_token, password_reset_expires, ...safeUser } = user as any;

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
      expires_in: parseInt(process.env.JWT_EXPIRATION || '86400', 10),
      user: safeUser,
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active || user.is_deleted) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.name) || [],
    };

    const access_token = this.jwtService.sign(newPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: parseInt(process.env.JWT_EXPIRATION || '86400', 10),
    });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: parseInt(process.env.JWT_EXPIRATION || '86400', 10),
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const token = randomBytes(32).toString('hex');

    try {
      await this.usersService.setPasswordResetToken(email, token, 3600);
    } catch {
      // Return same message whether email exists or not (security)
    }

    return {
      message: 'If an account with that email exists, a password reset token has been generated.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    await this.usersService.resetPassword(token, newPassword);

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
