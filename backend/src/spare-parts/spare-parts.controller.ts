import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { imagesInterceptor } from '../uploads/images.interceptor';
import { CreateSparePartDto } from './dto/create-spare-part.dto';
import { FindSparePartsQueryDto } from './dto/find-spare-parts-query.dto';
import { UpdateSparePartDto } from './dto/update-spare-part.dto';
import { SparePartsService } from './spare-parts.service';

@Controller('spare-parts')
export class SparePartsController {
  constructor(private readonly sparePartsService: SparePartsService) {}

  @Post()
  @UseInterceptors(imagesInterceptor())
  create(
    @Body() createSparePartDto: CreateSparePartDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.sparePartsService.create(createSparePartDto, files);
  }

  @Public()
  @Get()
  findAll(@Query() query: FindSparePartsQueryDto) {
    return this.sparePartsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.sparePartsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(imagesInterceptor())
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateSparePartDto: UpdateSparePartDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.sparePartsService.update(id, updateSparePartDto, files);
  }

  @Delete(':id/images/:filename')
  removeImage(
    @Param('id', ParseIdPipe) id: number,
    @Param('filename') filename: string,
  ) {
    return this.sparePartsService.removeImage(id, filename);
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.sparePartsService.remove(id);
  }
}
