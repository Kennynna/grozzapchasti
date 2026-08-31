import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { toInt } from '../../common/validation/transforms';

export class FindSparePartsQueryDto {
  @IsOptional()
  @Transform(toInt)
  @IsInt({ message: 'markId должен быть числом' })
  @IsPositive({ message: 'markId должен быть больше 0' })
  markId?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt({ message: 'modelId должен быть числом' })
  @IsPositive({ message: 'modelId должен быть больше 0' })
  modelId?: number;

  @IsOptional()
  @Transform(toInt)
  @IsInt({ message: 'categoryId должен быть числом' })
  @IsPositive({ message: 'categoryId должен быть больше 0' })
  categoryId?: number;
}
