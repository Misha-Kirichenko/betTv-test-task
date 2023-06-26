import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSeederService } from './auth/user.seeder.service';
import { User, UserSchema } from './auth/user.model';
import { CropModule } from './crop/crop.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get(
          'MONGO_PASSWORD',
        )}@${configService.get('HOST')}:${configService.get(
          'MONGO_PORT',
        )}/${configService.get('MONGO_DB')}`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    CropModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', `/${process.env.UPLOADS_DIR}`),
    }),
  ],
  providers: [UserSeederService],
})
export class AppModule {}
