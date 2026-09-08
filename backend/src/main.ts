import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import {
  flattenValidationErrors,
  hasMissingFields,
} from './common/validation/flatten-errors';
import { assertRuntimeEnv } from './config/secrets';

async function bootstrap() {
  assertRuntimeEnv();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
  app.setGlobalPrefix('api');
  app.enableCors({
    origin,
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => {
        const details = flattenValidationErrors(errors);
        return new BadRequestException({
          message: hasMissingFields(errors)
            ? 'Не все поля заполнены'
            : 'Ошибка валидации',
          details,
        });
      },
    }),
  );
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 4060);
}
void bootstrap();
