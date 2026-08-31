import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { imagesInterceptor } from '../uploads/images.interceptor';
import { CreateMarkDto } from './dto/create-mark.dto';
import { UpdateMarkDto } from './dto/update-mark.dto';
import { MarksService } from './marks.service';

@Controller('marks')
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post()
  @UseInterceptors(imagesInterceptor())
  create(
    @Body() createMarkDto: CreateMarkDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.marksService.create(createMarkDto, files);
  }

  @Public()
  @Get()
  findAll() {
    return this.marksService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number) {
    return this.marksService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(imagesInterceptor())
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() updateMarkDto: UpdateMarkDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.marksService.update(id, updateMarkDto, files);
  }

  @Delete(':id/images/:filename')
  removeImage(
    @Param('id', ParseIdPipe) id: number,
    @Param('filename') filename: string,
  ) {
    return this.marksService.removeImage(id, filename);
  }

  @Delete(':id')
  remove(@Param('id', ParseIdPipe) id: number) {
    return this.marksService.remove(id);
  }
}
