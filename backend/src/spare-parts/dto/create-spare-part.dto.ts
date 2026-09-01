import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { toInt, toNullableInt, trimString, trimToNull } from '../../common/validation/transforms';

export class CreateSparePartDto {
  @Transform(trimString)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(200, { message: 'Название не длиннее 200 символов' })
  name: string;

  @Transform(trimToNull)
  @IsOptional()
  @IsString({ message: 'Артикул должен быть строкой' })
  @MaxLength(64, { message: 'Артикул не длиннее 64 символов' })
  article?: string | null;

  @Transform(trimToNull)
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(4000, { message: 'Описание не длиннее 4000 символов' })
  description?: string | null;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Цена обязательна' })
  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(1, { message: 'Цена должна быть больше 0' })
  @Max(99_999_999, { message: 'Цена слишком большая' })
  price: number;

  @Transform(toNullableInt)
  @IsOptional()
  @IsInt({ message: 'Марка должна быть числом' })
  @IsPositive({ message: 'Марка должна быть больше 0' })
  markId?: number | null;

  @Transform(toNullableInt)
  @IsOptional()
  @IsInt({ message: 'Модель должна быть числом' })
  @IsPositive({ message: 'Модель должна быть больше 0' })
  modelId?: number | null;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Категория обязательна' })
  @IsInt({ message: 'Категория должна быть числом' })
  @IsPositive({ message: 'Категория обязательна' })
  categoryId: number;
}
