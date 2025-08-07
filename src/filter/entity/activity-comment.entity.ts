import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

/**
 * 活动评论实体
 * 存储用户对活动的评论信息
 */
@Entity('activity_comments')
export class ActivityComment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Activity, activity => activity.comments)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ type: 'tinyint', default: 5 })
  rating: number; // 1-5分

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}