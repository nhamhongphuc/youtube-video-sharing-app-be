import { EntityRepository, Repository } from 'typeorm';
import { Video } from './video.entity';

@EntityRepository(Video)
export class VideoRepository extends Repository<Video> {}
