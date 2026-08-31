import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { db } from '../prisma/db';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const existing = await db.orm.public.Admin.where((admin) =>
      admin.id.isNotNull(),
    ).first();
    if (existing) {
      return;
    }

    const login = this.config.get<string>('ADMIN_LOGIN') ?? 'admin';
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!password) {
      throw new Error('ADMIN_PASSWORD не задан — нечем создать администратора');
    }

    await db.orm.public.Admin.create({
      login,
      passwordHash: await bcrypt.hash(password, 12),
    });
  }

  async login(dto: LoginDto) {
    const admin = await db.orm.public.Admin.where({ login: dto.login }).first();
    if (!admin) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const matches = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    const accessToken = await this.jwt.signAsync({
      sub: admin.id,
      login: admin.login,
    });

    return {
      accessToken,
      admin: { id: admin.id, login: admin.login },
    };
  }

  async me(adminId: number) {
    const admin = await db.orm.public.Admin.where({ id: adminId }).first();
    if (!admin) {
      throw new UnauthorizedException();
    }
    return { id: admin.id, login: admin.login };
  }
}
