import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimString } from '../../common/validation/transforms';

export class LoginDto {
  @Transform(trimString)
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  @MaxLength(100, { message: 'Логин не длиннее 100 символов' })
  login: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(4, { message: 'Пароль слишком короткий' })
  @MaxLength(200, { message: 'Пароль не длиннее 200 символов' })
  password: string;
}
