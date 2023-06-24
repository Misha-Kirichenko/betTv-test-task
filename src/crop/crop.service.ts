import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CropService {
  async cropVideo(
    stream: Readable,
    extension: string,
  ): Promise<{
    firstPart: string;
    secondPart: string;
  }> {
    const uploadsDirectory = './uploads';
    await fsPromises.mkdir(uploadsDirectory);

    const tempFilePath = join(uploadsDirectory, `temp-${uuidv4()}${extension}`);
    const writeStream = fs.createWriteStream(tempFilePath);

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on('finish', () => resolve())
        .on('error', (error) => reject(error));
    });

    const duration = await this.getVideoDuration(tempFilePath);
    const trimmedStartPath = join(uploadsDirectory, `${uuidv4()}${extension}`);
    await this.trimVideo(tempFilePath, trimmedStartPath, 0, 300);

    const trimmedEndPath = join(uploadsDirectory, `${uuidv4()}${extension}`);
    await this.trimVideo(
      tempFilePath,
      trimmedEndPath,
      duration - 300,
      duration,
    );

    await fsPromises.unlink(tempFilePath);

    return {
      firstPart: trimmedStartPath,
      secondPart: trimmedStartPath,
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
