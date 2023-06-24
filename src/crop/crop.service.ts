import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

@Injectable()
export class CropService {
  async cropVideo(buffer: Buffer): Promise<void> {
    const uploadsDirectory = './uploads';
    await fsPromises.mkdir(uploadsDirectory, { recursive: true }); // Create the uploads directory if it doesn't exist

    const tempFilePath = join(uploadsDirectory, 'temp_video.mp4');
    await fsPromises.writeFile(tempFilePath, buffer); // Write the buffer to a temporary file

    const trimmedStartPath = join(uploadsDirectory, 'trimmed_start_video.mp4');
    await this.trimVideo(tempFilePath, trimmedStartPath, 0, 300); // 300 seconds = 5 minutes

    const duration = await this.getVideoDuration(tempFilePath);
    const trimmedEndPath = join(uploadsDirectory, 'trimmed_end_video.mp4');
    await this.trimVideo(tempFilePath, trimmedEndPath, duration - 300, duration);

    // Delete the temporary file
    await fsPromises.unlink(tempFilePath);

    console.log('Video processed successfully');
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
          const duration = metadata.format.duration;
          resolve(duration);
        }
      });
    });
  }
}
