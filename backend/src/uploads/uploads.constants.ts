export const MAX_PHOTOS = 3;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const IMAGE_FILENAME_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpe?g|png|webp|gif)$/i;

export const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

export const FILE_TOO_LARGE_MESSAGE = `Изображение слишком большое. Максимум ${MAX_FILE_SIZE_MB} МБ`;
export const TOO_MANY_PHOTOS_MESSAGE = `Можно загрузить не больше ${MAX_PHOTOS} фотографий`;
export const INVALID_IMAGE_TYPE_MESSAGE =
  'Можно загружать только jpeg, png, webp или gif';
