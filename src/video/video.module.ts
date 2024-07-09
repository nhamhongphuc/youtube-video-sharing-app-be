import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoRepository])],
  providers: [VideoService],
  controllers: [VideoController],
  exports: [],
})
export class VideoModule {}
