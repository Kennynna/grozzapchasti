import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'dotenv/config';
import { join } from 'path';
import { AppModule } from './app.module';
import {
  flattenValidationErrors,
  hasMissingFields,
} from './common/validation/flatten-errors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
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
