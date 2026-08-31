import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const logger = new Logger('tryWrite');

export async function tryWrite<T>(
  failMessage: string,
  action: () => Promise<T>,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    logger.error(error instanceof Error ? error.stack : error);
    throw new InternalServerErrorException(failMessage);
  }
}
