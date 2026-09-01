import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

const logger = new Logger('tryWrite');

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

export type WriteConflictMessages = {
  unique?: string;
  foreignKey?: string;
  missingRelation?: string;
};

function sqlStateOf(error: unknown): string | undefined {
  let current: unknown = error;
  const seen = new Set<unknown>();

  for (let i = 0; i < 8; i += 1) {
    if (!current || typeof current !== 'object' || seen.has(current)) {
      return undefined;
    }
    seen.add(current);

    const record = current as {
      sqlState?: unknown;
      code?: unknown;
      cause?: unknown;
      error?: unknown;
    };

    if (typeof record.sqlState === 'string') {
      return record.sqlState;
    }
    if (typeof record.code === 'string' && /^[0-9A-Z]{5}$/.test(record.code)) {
      return record.code;
    }

    current = record.cause ?? record.error;
  }

  return undefined;
}

export async function tryWrite<T>(
  failMessage: string,
  action: () => Promise<T>,
  conflicts?: WriteConflictMessages,
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }

    const sqlState = sqlStateOf(error);
    if (sqlState === UNIQUE_VIOLATION && conflicts?.unique) {
      throw new ConflictException(conflicts.unique);
    }
    if (sqlState === FOREIGN_KEY_VIOLATION) {
      if (conflicts?.foreignKey) {
        throw new ConflictException(conflicts.foreignKey);
      }
      if (conflicts?.missingRelation) {
        throw new NotFoundException(conflicts.missingRelation);
      }
    }

    logger.error(error instanceof Error ? error.stack : error);
    throw new InternalServerErrorException(failMessage);
  }
}
