import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'favorites' })
@Unique(['userId', 'roomId'])
export class FavoriteOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({ type: 'integer' })
  roomId: number;

  @CreateDateColumn()
  createdAt: Date;
}
