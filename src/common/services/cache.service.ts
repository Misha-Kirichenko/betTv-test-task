import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Video } from '../interfaces';

@Injectable()
export class CacheService {
  private readonly redisClient: Redis.Redis;

  constructor() {
    this.redisClient = new Redis(
      Number(process.env.REDIS_PORT),
      process.env.HOST,
      {
        password: process.env.REDIS_PASSWORD,
      },
    );
  }

  async addVideo(video: Video): Promise<void> {
    const videoString = JSON.stringify(video);
    await this.redisClient.sadd('videos', videoString);
  }

  async getRandomVideos(): Promise<Video[]> {
    const videos = await this.redisClient.srandmember('videos', 10);
    return videos.map((video) => JSON.parse(video));
  }
}
