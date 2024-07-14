import { Injectable } from '@nestjs/common';
import { VideoRepository } from './video.repository';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { ShareVideoPayloadDto } from './dto/video-payload.dto';
import { User } from '../auth/user.entity';
import { google } from 'googleapis';
import { VideoGateway } from './video.gateway';

@Injectable()
export class VideoService {
  constructor(
    @InjectRepository(VideoRepository)
    private videoRepository: VideoRepository,
    private configService: ConfigService,
    private videoGateway: VideoGateway,
  ) {}
  private youtube = google.youtube({
    version: 'v3',
    auth: this.configService.get('YTB_API_KEY'),
  });
  getVideos(): Promise<Video[]> {
    return this.videoRepository
      .createQueryBuilder('video')
      .innerJoin('video.user', 'user')
      .select('video.title', 'title')
      .addSelect('video.URL', 'URL')
      .addSelect('video.description', 'description')
      .addSelect('video.thumbnail', 'thumbnail')
      .addSelect('video.createdAt', 'createdAt')
      .addSelect('user.username', 'username')
      .orderBy('video.createdAt', 'DESC')
      .getRawMany();
  }

  async createVideo(video: ShareVideoPayloadDto, user: User): Promise<Video> {
    const videoID = this.extractVideoID(video.url);
    const videoInfo = await this.getYoutubeVideoInfo(videoID);

    if (!videoInfo) {
      throw new Error('Video not found');
    }

    const videoObj: Video = this.videoRepository.create({
      title: videoInfo.title,
      URL: video.url,
      description: videoInfo.description,
      thumbnail: videoInfo.thumbnails,
      user,
      createdAt: new Date(),
    });
    const createdVideo = await this.videoRepository.save(videoObj);

    this.videoGateway.notifyVideoShared(createdVideo.title, user.username);

    return createdVideo;
  }

  private extractVideoID(url: string): string {
    const regex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private async getYoutubeVideoInfo(
    videoID: string,
  ): Promise<{ title: string; description: string; thumbnails: string }> {
    const response = await this.youtube.videos.list({
      id: [videoID],
      part: ['snippet'],
    });
    if (!response.data.items.length) {
      throw new Error('Video not found');
    }
    const videoInfo = response.data.items[0].snippet;

    return {
      title: videoInfo.title,
      description: videoInfo.description,
      thumbnails:
        videoInfo.thumbnails.standard.url ||
        videoInfo.thumbnails.high.url ||
        videoInfo.thumbnails.medium.url ||
        videoInfo.thumbnails.default.url,
    };
  }
}
