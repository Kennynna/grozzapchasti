import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { sameText } from '../common/text';
import { db } from '../prisma/db';
import { UploadsService } from '../uploads/uploads.service';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';

const IMAGES_DIR = 'marks';

@Injectable()
export class MarksService {
  constructor(private readonly uploads: UploadsService) {}

  async create(dto: CreateMarkDto, files?: Express.Multer.File[]) {
    return tryWrite(
      'Не удалось создать марку',
      async () => {
        await this.assertUniqueName(dto.name);

        const images = await this.uploads.saveImages(IMAGES_DIR, files);
        try {
          return await db.orm.public.Mark.create({
            name: dto.name,
            description: dto.description ?? null,
            images,
          });
        } catch (error) {
          await this.uploads.removeFiles(images);
          throw error;
        }
      },
      { unique: 'Марка с таким названием уже есть' },
    );
  }

  findAll() {
    return db.orm.public.Mark.orderBy((mark) => mark.name.asc()).all();
  }

  async findOne(id: number) {
    const mark = await db.orm.public.Mark.where({ id }).first();
    if (!mark) {
      throw new NotFoundException('Марка не найдена');
    }
    return mark;
  }

  async update(id: number, dto: UpdateMarkDto, files?: Express.Multer.File[]) {
    return tryWrite(
      'Не удалось обновить марку',
      async () => {
        const mark = await this.findOne(id);

        if (dto.name !== undefined) {
          await this.assertUniqueName(dto.name, id);
        }

        const added = await this.uploads.saveImages(
          IMAGES_DIR,
          files,
          mark.images.length,
        );
        const patch = {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
          ...(added.length > 0 ? { images: [...mark.images, ...added] } : {}),
        };
        if (Object.keys(patch).length === 0) {
          return mark;
        }

        try {
          return await db.orm.public.Mark.where({ id }).update(patch);
        } catch (error) {
          await this.uploads.removeFiles(added);
          throw error;
        }
      },
      { unique: 'Марка с таким названием уже есть' },
    );
  }

  async remove(id: number) {
    return tryWrite('Не удалось удалить марку', async () => {
      const mark = await this.findOne(id);
      const models = await db.orm.public.Model.where({ markId: id }).all();
      const spareParts = await db.orm.public.SparePart.where({
        markId: id,
      }).all();
      const paths = [
        ...mark.images,
        ...models.flatMap((model) => model.images),
        ...spareParts.flatMap((part) => part.images),
      ];

      const deleted = await db.orm.public.Mark.where({ id }).delete();
      await this.uploads.removeFiles(paths);
      return deleted;
    });
  }

  async removeImage(id: number, filename: string) {
    return tryWrite('Не удалось обновить марку', async () => {
      const mark = await this.findOne(id);
      const publicPath = this.uploads.assertOwnedImage(
        mark.images,
        IMAGES_DIR,
        filename,
      );
      const images = mark.images.filter((path) => path !== publicPath);
      const updated = await db.orm.public.Mark.where({ id }).update({ images });
      await this.uploads.removeFile(publicPath);
      return updated;
    });
  }

  private async assertUniqueName(name: string, exceptId?: number) {
    const marks = await db.orm.public.Mark.all();
    if (
      marks.some((mark) => sameText(mark.name, name) && mark.id !== exceptId)
    ) {
      throw new ConflictException('Марка с таким названием уже есть');
    }
  }
}
