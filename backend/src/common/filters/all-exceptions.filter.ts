import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';
import {
  FILE_TOO_LARGE_MESSAGE,
  TOO_MANY_PHOTOS_MESSAGE,
} from '../../uploads/uploads.constants';

type ErrorBody = {
  statusCode: number;
  message: string;
  details?: string[];
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toBody(exception: unknown): ErrorBody {
    if (exception instanceof MulterError) {
      return this.fromMulter(exception);
    }

    if (exception instanceof HttpException) {
      return this.fromHttp(exception);
    }

    if (exception instanceof SyntaxError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Некорректное тело запроса',
      };
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
    };
  }

  private fromMulter(error: MulterError): ErrorBody {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: FILE_TOO_LARGE_MESSAGE,
      };
    }
    if (
      error.code === 'LIMIT_FILE_COUNT' ||
      error.code === 'LIMIT_UNEXPECTED_FILE'
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: TOO_MANY_PHOTOS_MESSAGE,
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Ошибка загрузки файла',
    };
  }

  private fromHttp(exception: HttpException): ErrorBody {
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return {
        statusCode,
        message: this.translate(payload),
      };
    }

    if (payload && typeof payload === 'object') {
      const record = payload as {
        message?: string | string[] | { message?: string; details?: string[] };
        details?: string[];
        error?: string;
      };

      if (
        record.message &&
        typeof record.message === 'object' &&
        !Array.isArray(record.message)
      ) {
        const nested = record.message;
        return {
          statusCode,
          message: this.translate(nested.message ?? exception.message),
          ...(nested.details?.length ? { details: nested.details } : {}),
        };
      }

      const rawMessage = record.message;
      const details = Array.isArray(record.details)
        ? record.details
        : Array.isArray(rawMessage)
          ? rawMessage
          : undefined;
      const message = Array.isArray(rawMessage)
        ? (rawMessage[0] ?? 'Ошибка запроса')
        : this.translate(rawMessage ?? exception.message);

      return {
        statusCode,
        message,
        ...(details?.length ? { details } : {}),
      };
    }

    return {
      statusCode,
      message: this.translate(exception.message),
    };
  }

  private translate(message: string): string {
    if (message.includes('numeric string is expected')) {
      return 'Некорректный id';
    }
    if (message === 'Payload Too Large') {
      return FILE_TOO_LARGE_MESSAGE;
    }
    return message;
  }
}
