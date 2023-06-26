import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CacheService } from 'src/common/services/cache.service';
import { Video } from 'src/common/interfaces';

@Controller()
export class AppController {
  constructor(private cacheService: CacheService) {}

  @Get('/getAll')
  @UseGuards(AuthGuard)
  getCachedVideos(): Promise<Video[]> {
    return this.cacheService.getRandomVideos();
  }
}
