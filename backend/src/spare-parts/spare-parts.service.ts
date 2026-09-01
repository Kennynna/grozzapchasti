import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { sameText } from '../common/text';
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
    return tryWrite(
      'Не удалось создать запчасть',
      async () => {
        await this.assertRelations(dto.markId, dto.modelId, dto.categoryId);
        await this.assertArticleFree(dto.article);

        const images = await this.uploads.saveImages(IMAGES_DIR, files);
        try {
          return await db.orm.public.SparePart.create({
            name: dto.name,
            article: dto.article ?? null,
            description: dto.description ?? null,
            price: dto.price,
            markId: dto.markId ?? null,
            modelId: dto.modelId ?? null,
            categoryId: dto.categoryId,
            images,
          });
        } catch (error) {
          await this.uploads.removeFiles(images);
          throw error;
        }
      },
      {
        unique: 'Запчасть с таким артикулом уже есть',
        missingRelation: 'Связанная запись не найдена',
      },
    );
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

    const collection =
      Object.keys(where).length === 0
        ? db.orm.public.SparePart
        : db.orm.public.SparePart.where(where);
    return collection.orderBy((part) => part.name.asc()).all();
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
    return tryWrite(
      'Не удалось обновить запчасть',
      async () => {
        const part = await this.findOne(id);
        const markId = dto.markId !== undefined ? dto.markId : part.markId;
        const modelId = dto.modelId !== undefined ? dto.modelId : part.modelId;
        const categoryId = dto.categoryId ?? part.categoryId;

        if (
          dto.markId !== undefined ||
          dto.modelId !== undefined ||
          dto.categoryId !== undefined
        ) {
          await this.assertRelations(markId, modelId, categoryId);
        }
        if (dto.article !== undefined) {
          await this.assertArticleFree(dto.article, id);
        }

        const added = await this.uploads.saveImages(
          IMAGES_DIR,
          files,
          part.images.length,
        );
        const patch = {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.article !== undefined ? { article: dto.article } : {}),
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
      },
      {
        unique: 'Запчасть с таким артикулом уже есть',
        missingRelation: 'Связанная запись не найдена',
      },
    );
  }

  async remove(id: number) {
    return tryWrite('Не удалось удалить запчасть', async () => {
      const part = await this.findOne(id);
      const deleted = await db.orm.public.SparePart.where({ id }).delete();
      await this.uploads.removeFiles(part.images);
      return deleted;
    });
  }

  async removeImage(id: number, filename: string) {
    return tryWrite('Не удалось обновить запчасть', async () => {
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
    });
  }

  private async assertRelations(
    markId: number | null | undefined,
    modelId: number | null | undefined,
    categoryId: number,
  ) {
    if (modelId && !markId) {
      throw new BadRequestException('Марка обязательна, если выбрана модель');
    }

    const [mark, model, category] = await Promise.all([
      markId
        ? db.orm.public.Mark.where({ id: markId }).first()
        : Promise.resolve(null),
      modelId
        ? db.orm.public.Model.where({ id: modelId }).first()
        : Promise.resolve(null),
      db.orm.public.Category.where({ id: categoryId }).first(),
    ]);

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    if (markId && !mark) {
      throw new NotFoundException('Марка не найдена');
    }
    if (modelId && !model) {
      throw new NotFoundException('Модель не найдена');
    }
    if (model && markId && model.markId !== markId) {
      throw new BadRequestException('Модель не принадлежит выбранной марке');
    }
  }

  private async assertArticleFree(
    article: string | null | undefined,
    exceptId?: number,
  ) {
    if (!article) {
      return;
    }
    const parts = await db.orm.public.SparePart.all();
    if (
      parts.some(
        (part) =>
          part.article &&
          sameText(part.article, article) &&
          part.id !== exceptId,
      )
    ) {
      throw new ConflictException('Запчасть с таким артикулом уже есть');
    }
  }
}
