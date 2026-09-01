import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString, trimToNull } from '../../common/validation/transforms';

export class CreateCategoryDto {
  @Transform(trimString)
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(100, { message: 'Название не длиннее 100 символов' })
  name: string;

  @Transform(trimToNull)
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(2000, { message: 'Описание не длиннее 2000 символов' })
  description?: string | null;
}
