import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CropController } from './crop.controller';
import { CropService } from './crop.service';
import { Video, VideoSchema } from './video.model';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../common/services/cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CropController],
  providers: [CropService, CacheService],
})
export class CropModule {}
