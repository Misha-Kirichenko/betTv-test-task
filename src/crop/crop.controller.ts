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

@Controller('crop')
export class CropController {
  constructor(private cropService: CropService) {}

  
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('video'))
  async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<CropResult> {
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
