import { Exclude } from 'class-transformer';
import { User } from '../auth/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  URL: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  thumbnail: string;

  @ManyToOne((_type) => User, (user) => user.videos, { eager: false })
  @Exclude({ toPlainOnly: true })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
