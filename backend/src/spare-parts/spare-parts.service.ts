import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { db } from '../prisma/db';
import { UploadsService } from '../uploads/uploads.service';
import { CreateSparePartDto } from './dto/create-spare-part.dto';
import { FindSparePartsQueryDto } from './dto/find-spare-parts-query.dto';
import { UpdateSparePartDto } from './dto/update-spare-part.dto';

const IMAGES_DIR = 'spare-parts';

@Injectable()
export class SparePartsService {
  constructor(private readonly uploads: UploadsService) {}

  async create(dto: CreateSparePartDto, files?: Express.Multer.File[]) {
    return tryWrite('Не удалось создать запчасть', async () => {
      await this.assertRelations(dto.markId, dto.modelId, dto.categoryId);

      const images = await this.uploads.saveImages(IMAGES_DIR, files);
      try {
        return await db.orm.public.SparePart.create({
          name: dto.name,
          description: dto.description ?? null,
          price: dto.price,
          markId: dto.markId,
          modelId: dto.modelId,
          categoryId: dto.categoryId,
          images,
        });
      } catch (error) {
        await this.uploads.removeFiles(images);
        throw error;
      }
    });
  }

  findAll(query: FindSparePartsQueryDto) {
    const where: {
      markId?: number;
      modelId?: number;
      categoryId?: number;
    } = {};
    if (query.markId) where.markId = query.markId;
    if (query.modelId) where.modelId = query.modelId;
    if (query.categoryId) where.categoryId = query.categoryId;

    if (Object.keys(where).length === 0) {
      return db.orm.public.SparePart.all();
    }
    return db.orm.public.SparePart.where(where).all();
  }

  async findOne(id: number) {
    const part = await db.orm.public.SparePart.where({ id }).first();
    if (!part) {
      throw new NotFoundException('Запчасть не найдена');
    }
    return part;
  }

  async update(
    id: number,
    dto: UpdateSparePartDto,
    files?: Express.Multer.File[],
  ) {
    return tryWrite('Не удалось обновить запчасть', async () => {
      const part = await this.findOne(id);
      const markId = dto.markId ?? part.markId;
      const modelId = dto.modelId ?? part.modelId;
      const categoryId = dto.categoryId ?? part.categoryId;

      if (
        dto.markId !== undefined ||
        dto.modelId !== undefined ||
        dto.categoryId !== undefined
      ) {
        await this.assertRelations(markId, modelId, categoryId);
      }

      const added = await this.uploads.saveImages(
        IMAGES_DIR,
        files,
        part.images.length,
      );
      const patch = {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.markId !== undefined ? { markId: dto.markId } : {}),
        ...(dto.modelId !== undefined ? { modelId: dto.modelId } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(added.length > 0 ? { images: [...part.images, ...added] } : {}),
      };
      if (Object.keys(patch).length === 0) {
        return part;
      }

      try {
        return await db.orm.public.SparePart.where({ id }).update(patch);
      } catch (error) {
        await this.uploads.removeFiles(added);
        throw error;
      }
    });
  }

  async remove(id: number) {
    const part = await this.findOne(id);
    const deleted = await db.orm.public.SparePart.where({ id }).delete();
    await this.uploads.removeFiles(part.images);
    return deleted;
  }

  async removeImage(id: number, filename: string) {
    const part = await this.findOne(id);
    const publicPath = this.uploads.assertOwnedImage(
      part.images,
      IMAGES_DIR,
      filename,
    );
    const images = part.images.filter((path) => path !== publicPath);
    const updated = await db.orm.public.SparePart.where({ id }).update({
      images,
    });
    await this.uploads.removeFile(publicPath);
    return updated;
  }

  private async assertRelations(
    markId: number,
    modelId: number,
    categoryId: number,
  ) {
    const [mark, model, category] = await Promise.all([
      db.orm.public.Mark.where({ id: markId }).first(),
      db.orm.public.Model.where({ id: modelId }).first(),
      db.orm.public.Category.where({ id: categoryId }).first(),
    ]);

    if (!mark) {
      throw new NotFoundException('Марка не найдена');
    }
    if (!model) {
      throw new NotFoundException('Модель не найдена');
    }
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    if (model.markId !== markId) {
      throw new BadRequestException('Модель не принадлежит выбранной марке');
    }
  }
}
