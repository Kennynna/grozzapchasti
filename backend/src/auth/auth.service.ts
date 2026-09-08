import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { db } from '../prisma/db';
import { assertAdminPassword } from '../config/secrets';
import { BCRYPT_ROUNDS } from './auth.constants';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyPasswordHash = '';

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.dummyPasswordHash = await bcrypt.hash(
      'not-a-real-admin-password',
      BCRYPT_ROUNDS,
    );

    const existing = await db.orm.public.Admin.where((admin) =>
      admin.id.isNotNull(),
    ).first();
    if (existing) {
      return;
    }

    const login = this.config.get<string>('ADMIN_LOGIN')?.trim();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!login || !password) {
      throw new Error('ADMIN_LOGIN и ADMIN_PASSWORD не заданы — нечем создать администратора');
    }
    assertAdminPassword(password);

    await db.orm.public.Admin.create({
      login,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
  }

  async login(dto: LoginDto) {
    const admin = await db.orm.public.Admin.where({ login: dto.login }).first();
    const passwordHash = admin?.passwordHash ?? this.dummyPasswordHash;
    const matches = await bcrypt.compare(dto.password, passwordHash);
    if (!admin || !matches) {
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
      throw new UnauthorizedException('Сессия недействительна');
    }
    return { id: admin.id, login: admin.login };
  }
}
