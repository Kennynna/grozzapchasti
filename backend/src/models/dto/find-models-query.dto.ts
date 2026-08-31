import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { toInt } from '../../common/validation/transforms';

export class FindModelsQueryDto {
  @IsOptional()
  @Transform(toInt)
  @IsInt({ message: 'markId должен быть числом' })
  @IsPositive({ message: 'markId должен быть больше 0' })
  markId?: number;
}
