import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { toInt, trimString } from '../../common/validation/transforms';

export class CreateModelDto {
  @Transform(trimString)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(100, { message: 'Название не длиннее 100 символов' })
  name: string;

  @Transform(trimString)
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(2000, { message: 'Описание не длиннее 2000 символов' })
  description?: string;

  @Transform(toInt)
  @IsNotEmpty({ message: 'Марка обязательна' })
  @IsInt({ message: 'Марка должна быть числом' })
  @IsPositive({ message: 'Марка обязательна' })
  markId: number;
}
