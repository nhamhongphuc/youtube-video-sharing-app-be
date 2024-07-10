import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { Video } from './video.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from 'src/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forFeature([VideoRepository, Video]),
    AuthModule,
  ],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [],
})
export class VideoModule {}
