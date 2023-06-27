import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { Readable } from 'stream';
import { AuthGuard } from 'src/auth/auth.guard';
import { CropService } from './crop.service';
import { CropResult } from 'src/common/interfaces';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('crop')
export class CropController {
  constructor(private cropService: CropService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        video: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Crop first and last 5 minutes of uploaded video',
    schema: {
      type: 'object',
      example: {
        startPartFileUrl:
          'localhost:3000/videos/ad54cb6f-8e74-4d70-9134-cbd87a8b61c5.mp4',
        endPartFileUrl:
          'localhost:3000/videos/bd57cb6f-1e82-1d78-9134-cbd94f8b31c7.mp4',
      },
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
  @ApiTags('Crop video')
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CropResult> {
    const allowedExtensions = ['.mp4', '.avi', '.mkv'];
    const extension = extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      throw new BadRequestException(
        `Only ${allowedExtensions.join(',')} files are allowed!`,
      );
    }

    const stream = Readable.from(file.buffer);
    return this.cropService.cropVideo(stream, extension, file.originalname);
  }
}
