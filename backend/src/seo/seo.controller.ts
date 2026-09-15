import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { SeoService } from './seo.service';

@Public()
@Controller()
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('sitemap.xml')
  @Header('Cache-Control', 'public, max-age=600')
  async sitemap(@Res() res: Response) {
    const xml = await this.seoService.buildSitemap();
    res.type('application/xml; charset=utf-8').send(xml);
  }
}
