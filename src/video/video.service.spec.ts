import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { VideoRepository } from './video.repository';
import { ConfigService } from '@nestjs/config';
import { VideoGateway } from './video.gateway';
import { ShareVideoPayloadDto } from './dto/video-payload.dto';
import { User } from '../auth/user.entity';
import { google } from 'googleapis';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from './video.entity';

jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn().mockReturnValue({
      videos: {
        list: jest.fn(),
      },
    }),
  },
}));

describe('VideoService', () => {
  let service: VideoService;
  let videoRepository: VideoRepository;
  let videoGateway: VideoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: getRepositoryToken(VideoRepository),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            }),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('API_KEY'),
          },
        },
        {
          provide: VideoGateway,
          useValue: {
            notifyVideoShared: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
    videoRepository = module.get<VideoRepository>(
      getRepositoryToken(VideoRepository),
    );
    videoGateway = module.get<VideoGateway>(VideoGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVideos', () => {
    it('should return a list of videos', async () => {
      const videoData = [
        {
          title: 'Test Video',
          URL: 'http://test.com',
          description: 'Test description',
          thumbnail: 'http://thumbnail.com',
          createdAt: new Date(),
          username: 'testuser',
        },
      ];

      videoRepository.createQueryBuilder().getRawMany = jest
        .fn()
        .mockResolvedValue(videoData);

      const result = await service.getVideos();
      expect(result).toEqual(videoData);
    });
  });

  describe('createVideo', () => {
    it('should create and return a video', async () => {
      const videoDto: ShareVideoPayloadDto = {
        url: 'https://www.youtube.com/watch?v=testID',
      };
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'testpassword',
        videos: [],
      };

      const videoInfo = {
        title: 'Test Video',
        description: 'Test Description',
        thumbnails: {
          standard: {
            url: 'http://thumbnail.com',
          },
        },
      };
      const mockVideosList = jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              snippet: videoInfo,
            },
          ],
        },
      });
      (google.youtube('v3').videos.list as any) = mockVideosList;

      const createdVideo: Video = {
        id: '1',
        title: videoInfo.title,
        URL: videoDto.url,
        description: videoInfo.description,
        thumbnail: videoInfo.thumbnails.standard.url,
        user,
        createdAt: new Date(),
      };

      videoRepository.create = jest.fn().mockReturnValue(createdVideo);
      videoRepository.save = jest.fn().mockResolvedValue(createdVideo);

      const result = await service.createVideo(videoDto, user);
      expect(result).toEqual(createdVideo);
      expect(videoGateway.notifyVideoShared).toHaveBeenCalledWith(
        videoInfo.title,
        user.username,
      );
    });

    it('should throw an error if video not found on YouTube', async () => {
      const videoDto: ShareVideoPayloadDto = {
        url: 'https://www.youtube.com/watch?v=invalidID',
      };
      const user: User = {
        id: '1',
        username: 'testuser',
        password: 'testpassword',
        videos: [],
      };

      const mockVideosList = jest.fn().mockResolvedValue({
        data: {
          items: [],
        },
      });
      (google.youtube('v3').videos.list as any) = mockVideosList;
      await expect(service.createVideo(videoDto, user)).rejects.toThrow(
        'Video not found',
      );
    });
  });
});
