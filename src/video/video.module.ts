import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from '../config.schema';
import { VideoGateway } from './video.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forFeature([VideoRepository, Video]),
    AuthModule,
  ],
  providers: [VideoService, VideoGateway],
  controllers: [VideoController],
  exports: [],
})
export class VideoModule {}
