import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { tryWrite } from '../common/errors/try-write';
import { db } from '../prisma/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  async create(dto: CreateCategoryDto) {
    return tryWrite('Не удалось создать категорию', async () => {
      await this.assertUniqueName(dto.name);
      return db.orm.public.Category.create({
        name: dto.name,
        description: dto.description ?? null,
      });
    });
  }

  findAll() {
    return db.orm.public.Category.all();
  }

  async findOne(id: number) {
    const category = await db.orm.public.Category.where({ id }).first();
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return tryWrite('Не удалось обновить категорию', async () => {
      const category = await this.findOne(id);
      if (dto.name && dto.name !== category.name) {
        await this.assertUniqueName(dto.name);
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
    });
  }

  async remove(id: number) {
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
  }

  private async assertUniqueName(name: string) {
    const existing = await db.orm.public.Category.where({ name }).first();
    if (existing) {
      throw new ConflictException('Категория с таким названием уже есть');
    }
  }
}
