import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './video.model';
import { CacheService } from '../common/services/cache.service';
import { CropResult } from 'src/common/interfaces';

@Injectable()
export class CropService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
    private cacheService: CacheService,
  ) {}

  async cropVideo(
    stream: Readable,
    extension: string,
    origin: string,
  ): Promise<CropResult> {
    let startPartFileUrl = '';
    let endPartFileUrl = '';
    const startPartFile = `${uuidv4()}${extension}`;
    const endPartFile = `${uuidv4()}${extension}`;

    await fsPromises.mkdir(`${process.env.UPLOADS_DIR}/videos`, {
      recursive: true,
    });

    const tempFilePath = join(
      `${process.env.UPLOADS_DIR}/videos`,
      `temp-${uuidv4()}${extension}`,
    );
    const writeStream = fs.createWriteStream(tempFilePath);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });

    const duration = await this.getVideoDuration(tempFilePath);
    const outputStartPath = join(
      `${process.env.UPLOADS_DIR}/videos`,
      startPartFile,
    );

    // if duration is less than 300, there's no need to crop video
    if (duration <= 300) {
      await fsPromises.rename(tempFilePath, outputStartPath);
      startPartFileUrl = `${process.env.HOST}:${process.env.PORT}/videos/${startPartFile}`;

      await this.videoModel.create({
        name: startPartFile,
        origin,
        type: extension,
      });
    } else {
      startPartFileUrl = `${process.env.HOST}:${process.env.PORT}/videos/${startPartFile}`;
      endPartFileUrl = `${process.env.HOST}:${process.env.PORT}/videos/${endPartFile}`;

      const trimmedStartPath = join(
        `./${process.env.UPLOADS_DIR}/videos`,
        startPartFile,
      );
      await this.trimVideo(tempFilePath, trimmedStartPath, 0, 300);
      await this.videoModel.create({
        name: startPartFile,
        origin,
        type: extension,
      });

      const trimmedEndPath = join(
        `./${process.env.UPLOADS_DIR}/videos`,
        endPartFile,
      );
      await this.trimVideo(
        tempFilePath,
        trimmedEndPath,
        duration - 300,
        duration,
      );

      await this.cacheService.addVideo({
        name: endPartFile,
        origin,
        type: extension,
      });

      /*unlink only if both parts present because 
      in case of one part we just rename temp file*/
      await fsPromises.unlink(tempFilePath);
    }

    return {
      startPartFileUrl,
      endPartFileUrl,
    };
  }

  async trimVideo(
    inputFilePath: string,
    outputFilePath: string,
    start: number,
    end: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .setStartTime(start)
        .setDuration(end - start)
        .output(outputFilePath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        })
        .run();
    });
  }

  private getVideoDuration(inputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const { duration } = metadata.format;
          resolve(duration);
        }
      });
    });
  }
}
