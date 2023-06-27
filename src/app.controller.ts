import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { CacheService } from 'src/common/services/cache.service';
import { Video } from 'src/common/interfaces';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private cacheService: CacheService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get random 10 cached videos information',
    schema: {
      type: 'array',
      example: [
        {
          name: 'ad54cb6f-8e74-4d70-9134-cbd87a8b61c5.mp4',
          origin: '003.mp4',
          timestamp: Date.now(),
          type: '.mp4',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        statusCode: 401,
        error: 'Unauthorized',
      },
    },
    description: 'No token passed',
  })
  @Get('/getAll')
  @ApiTags('Cached videos')
  @UseGuards(AuthGuard)
  getCachedVideos(): Promise<Video[]> {
    return this.cacheService.getRandomVideos();
  }
}
