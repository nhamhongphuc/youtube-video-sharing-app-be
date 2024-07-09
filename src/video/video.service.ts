import { Injectable } from '@nestjs/common';
import { VideoRepository } from './video.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './video.entity';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoRepository)
    private videoRepository: VideoRepository,
  ) {}

  getVideos(): Promise<Video[]> {
    return this.videoRepository.createQueryBuilder('video').getMany();
  }
}
