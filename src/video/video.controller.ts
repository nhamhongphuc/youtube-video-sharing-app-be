import { Controller, Get } from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './video.entity';

@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Get()
  getVideos(): Promise<Video[]> {
    return this.videoService.getVideos();
  }
}
