import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import {
  LOGIN_THROTTLE_LIMIT,
  LOGIN_THROTTLE_TTL_MS,
  LOGIN_TOO_MANY_ATTEMPTS_MESSAGE,
} from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: LOGIN_THROTTLE_TTL_MS,
          limit: LOGIN_THROTTLE_LIMIT,
        },
      ],
      errorMessage: LOGIN_TOO_MANY_ATTEMPTS_MESSAGE,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ThrottlerGuard],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
