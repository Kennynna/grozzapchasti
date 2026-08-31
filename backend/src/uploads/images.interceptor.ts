import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  INVALID_IMAGE_TYPE_MESSAGE,
  MAX_FILE_SIZE,
  MAX_PHOTOS,
} from './uploads.constants';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function imagesInterceptor(field = 'images') {
  return FilesInterceptor(field, MAX_PHOTOS, {
    storage: memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_PHOTOS },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        cb(new BadRequestException(INVALID_IMAGE_TYPE_MESSAGE), false);
        return;
      }
      cb(null, true);
    },
  });
}
