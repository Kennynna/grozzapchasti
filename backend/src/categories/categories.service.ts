import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { sameText } from '../common/text';
import { db } from '../prisma/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async create(dto: CreateCategoryDto) {
    return tryWrite(
      'Не удалось создать категорию',
      async () => {
        await this.assertUniqueName(dto.name);
        return db.orm.public.Category.create({
          name: dto.name,
          description: dto.description ?? null,
        });
      },
      { unique: 'Категория с таким названием уже есть' },
    );
  }

  findAll() {
    return db.orm.public.Category.orderBy((category) =>
      category.name.asc(),
    ).all();
  }

  async findOne(id: number) {
    const category = await db.orm.public.Category.where({ id }).first();
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return tryWrite(
      'Не удалось обновить категорию',
      async () => {
        const category = await this.findOne(id);
        if (dto.name !== undefined) {
          await this.assertUniqueName(dto.name, id);
        }
        const patch = {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined
            ? { description: dto.description }
            : {}),
        };
        if (Object.keys(patch).length === 0) {
          return category;
        }
        return db.orm.public.Category.where({ id }).update(patch);
      },
      { unique: 'Категория с таким названием уже есть' },
    );
  }

  async remove(id: number) {
    return tryWrite(
      'Не удалось удалить категорию',
      async () => {
        await this.findOne(id);
        const used = await db.orm.public.SparePart.where({
          categoryId: id,
        }).first();
        if (used) {
          throw new ConflictException(
            'Нельзя удалить категорию, пока к ней привязаны запчасти',
          );
        }
        return db.orm.public.Category.where({ id }).delete();
      },
      {
        foreignKey: 'Нельзя удалить категорию, пока к ней привязаны запчасти',
      },
    );
  }

  private async assertUniqueName(name: string, exceptId?: number) {
    const categories = await db.orm.public.Category.all();
    if (
      categories.some(
        (category) => sameText(category.name, name) && category.id !== exceptId,
      )
    ) {
      throw new ConflictException('Категория с таким названием уже есть');
    }
  }
}
