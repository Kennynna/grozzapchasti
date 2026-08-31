import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { db } from '../prisma/db';
import { UploadsService } from '../uploads/uploads.service';
import { CreateModelDto } from './dto/create-model.dto';
import { FindModelsQueryDto } from './dto/find-models-query.dto';
import { UpdateModelDto } from './dto/update-model.dto';

const IMAGES_DIR = 'models';

@Injectable()
export class ModelsService {
  constructor(private readonly uploads: UploadsService) {}

  async create(dto: CreateModelDto, files?: Express.Multer.File[]) {
    return tryWrite('Не удалось создать модель', async () => {
      await this.assertMarkExists(dto.markId);
      await this.assertUniqueName(dto.name, dto.markId);

      const images = await this.uploads.saveImages(IMAGES_DIR, files);
      try {
        return await db.orm.public.Model.create({
          name: dto.name,
          description: dto.description ?? null,
          markId: dto.markId,
          images,
        });
      } catch (error) {
        await this.uploads.removeFiles(images);
        throw error;
      }
    });
  }

  findAll(query: FindModelsQueryDto) {
    if (query.markId) {
      return db.orm.public.Model.where({ markId: query.markId }).all();
    }
    return db.orm.public.Model.all();
  }

  async findOne(id: number) {
    const model = await db.orm.public.Model.where({ id }).first();
    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }
    return model;
  }

  async update(id: number, dto: UpdateModelDto, files?: Express.Multer.File[]) {
    return tryWrite('Не удалось обновить модель', async () => {
      const model = await this.findOne(id);
      const nextMarkId = dto.markId ?? model.markId;
      const nextName = dto.name ?? model.name;

      if (dto.markId !== undefined) {
        await this.assertMarkExists(dto.markId);
      }
      if (nextName !== model.name || nextMarkId !== model.markId) {
        await this.assertUniqueName(nextName, nextMarkId, id);
      }

      const added = await this.uploads.saveImages(
        IMAGES_DIR,
        files,
        model.images.length,
      );
      const patch = {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.markId !== undefined ? { markId: dto.markId } : {}),
        ...(added.length > 0 ? { images: [...model.images, ...added] } : {}),
      };

      if (Object.keys(patch).length === 0) {
        return model;
      }

      try {
        const updated = await db.orm.public.Model.where({ id }).update(patch);

        if (dto.markId !== undefined && dto.markId !== model.markId) {
          await db.orm.public.SparePart.where({ modelId: id }).updateAll({
            markId: dto.markId,
          });
        }

        return updated;
      } catch (error) {
        await this.uploads.removeFiles(added);
        throw error;
      }
    });
  }

  async remove(id: number) {
    const model = await this.findOne(id);
    const spareParts = await db.orm.public.SparePart.where({
      modelId: id,
    }).all();
    const paths = [
      ...model.images,
      ...spareParts.flatMap((part) => part.images),
    ];

    const deleted = await db.orm.public.Model.where({ id }).delete();
    await this.uploads.removeFiles(paths);
    return deleted;
  }

  async removeImage(id: number, filename: string) {
    const model = await this.findOne(id);
    const publicPath = this.uploads.assertOwnedImage(
      model.images,
      IMAGES_DIR,
      filename,
    );
    const images = model.images.filter((path) => path !== publicPath);
    const updated = await db.orm.public.Model.where({ id }).update({ images });
    await this.uploads.removeFile(publicPath);
    return updated;
  }

  private async assertMarkExists(markId: number) {
    const mark = await db.orm.public.Mark.where({ id: markId }).first();
    if (!mark) {
      throw new NotFoundException('Марка не найдена');
    }
  }

  private async assertUniqueName(
    name: string,
    markId: number,
    exceptId?: number,
  ) {
    const existing = await db.orm.public.Model.where({ name, markId }).first();
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(
        'Модель с таким названием уже есть у этой марки',
      );
    }
  }
}
