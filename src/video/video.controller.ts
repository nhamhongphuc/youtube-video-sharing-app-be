import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { VideoService } from './video.service';
import { Video } from './video.entity';
import { ShareVideoPayloadDto } from './dto/video-payload.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('videos')
@UseGuards(AuthGuard())
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Get()
  getVideos(): Promise<Video[]> {
    return this.videoService.getVideos();
  }

  @Post()
  createVideo(
    @Body() shareVideoPayloadDto: ShareVideoPayloadDto,
    @GetUser() user: User,
  ): Promise<Video> {
    return this.videoService.createVideo(shareVideoPayloadDto, user);
  }
}
