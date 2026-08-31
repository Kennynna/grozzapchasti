import { Module } from '@nestjs/common';
import { SparePartsService } from './spare-parts.service';
import { SparePartsController } from './spare-parts.controller';

@Module({
  controllers: [SparePartsController],
  providers: [SparePartsService],
})
export class SparePartsModule {}
