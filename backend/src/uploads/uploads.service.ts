import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { sniffImageMime } from './image-type';
import {
  EXT_BY_MIME,
  FILE_TOO_LARGE_MESSAGE,
  IMAGE_FILENAME_RE,
  INVALID_IMAGE_TYPE_MESSAGE,
  MAX_FILE_SIZE,
  MAX_PHOTOS,
  TOO_MANY_PHOTOS_MESSAGE,
} from './uploads.constants';

@Injectable()
export class UploadsService {
  private readonly root = join(process.cwd(), 'uploads');

  publicPath(subdir: string, filename: string): string {
    return `/uploads/${subdir}/${filename}`;
  }

  async saveImages(
    subdir: string,
    files: Express.Multer.File[] | undefined,
    existingCount = 0,
  ): Promise<string[]> {
    const incoming = files ?? [];
    if (incoming.length === 0) {
      return [];
    }
    if (existingCount + incoming.length > MAX_PHOTOS) {
      throw new BadRequestException(TOO_MANY_PHOTOS_MESSAGE);
    }

    const saved: string[] = [];
    try {
      const dir = join(this.root, subdir);
      await mkdir(dir, { recursive: true });

      for (const file of incoming) {
        if (file.size > MAX_FILE_SIZE) {
          throw new BadRequestException(FILE_TOO_LARGE_MESSAGE);
        }
        const sniffed = sniffImageMime(file.buffer);
        if (!sniffed || sniffed !== file.mimetype) {
          throw new BadRequestException(INVALID_IMAGE_TYPE_MESSAGE);
        }
        const ext = EXT_BY_MIME[sniffed];
        if (!ext) {
          throw new BadRequestException(INVALID_IMAGE_TYPE_MESSAGE);
        }
        const filename = `${randomUUID()}${ext}`;
        await writeFile(join(dir, filename), file.buffer);
        saved.push(this.publicPath(subdir, filename));
      }
      return saved;
    } catch (error) {
      await this.removeFiles(saved);
      throw error;
    }
  }

  async removeFile(publicPath: string): Promise<void> {
    const abs = this.toAbsolute(publicPath);
    await unlink(abs).catch(() => undefined);
  }

  async removeFiles(paths: readonly string[]): Promise<void> {
    await Promise.all(paths.map((path) => this.removeFile(path)));
  }

  assertOwnedImage(
    images: readonly string[],
    subdir: string,
    filename: string,
  ): string {
    if (!IMAGE_FILENAME_RE.test(filename)) {
      throw new BadRequestException('Некорректное имя файла');
    }
    const publicPath = this.publicPath(subdir, filename);
    if (!images.includes(publicPath)) {
      throw new BadRequestException('Фотография не принадлежит этой записи');
    }
    return publicPath;
  }

  private toAbsolute(publicPath: string): string {
    if (!publicPath.startsWith('/uploads/')) {
      throw new BadRequestException('Некорректный путь к файлу');
    }
    const relative = publicPath.replace(/^\/uploads\//, '');
    const abs = resolve(this.root, relative);
    if (!abs.startsWith(resolve(this.root))) {
      throw new BadRequestException('Некорректный путь к файлу');
    }
    return abs;
  }
}
