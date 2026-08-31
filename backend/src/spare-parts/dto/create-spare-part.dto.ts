import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { toInt, trimString } from '../../common/validation/transforms';

export class CreateSparePartDto {
  @Transform(trimString)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(200, { message: 'Название не длиннее 200 символов' })
  name: string;

  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(4000, { message: 'Описание не длиннее 4000 символов' })
  description?: string;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Цена обязательна' })
  @IsInt({ message: 'Цена должна быть целым числом' })
  @Min(1, { message: 'Цена должна быть больше 0' })
  price: number;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Марка обязательна' })
  @IsInt({ message: 'Марка должна быть числом' })
  @IsPositive({ message: 'Марка обязательна' })
  markId: number;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Модель обязательна' })
  @IsInt({ message: 'Модель должна быть числом' })
  @IsPositive({ message: 'Модель обязательна' })
  modelId: number;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Категория обязательна' })
  @IsInt({ message: 'Категория должна быть числом' })
  @IsPositive({ message: 'Категория обязательна' })
  categoryId: number;
}
