import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Некорректный id');
    }
    return id;
  }
}
