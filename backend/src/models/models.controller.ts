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
import { CreateModelDto } from './dto/create-model.dto';
import { FindModelsQueryDto } from './dto/find-models-query.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post()
  @UseInterceptors(imagesInterceptor())
  create(
    @Body() createModelDto: CreateModelDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.modelsService.create(createModelDto, files);
  }

  @Public()
  @Get()
  findAll(@Query() query: FindModelsQueryDto) {
    return this.modelsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.modelsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(imagesInterceptor())
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateModelDto: UpdateModelDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.modelsService.update(id, updateModelDto, files);
  }

  @Delete(':id/images/:filename')
  removeImage(
    @Param('id', ParseIdPipe) id: number,
    @Param('filename') filename: string,
  ) {
    return this.modelsService.removeImage(id, filename);
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.modelsService.remove(id);
  }
}
