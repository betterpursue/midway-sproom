import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActivityRegistration } from './activity-registration.entity';
import { ActivityComment } from './activity-comment.entity';

export enum ActivityStatus {
  PENDING = 'pending',
  OPEN = 'open',
  FULL = 'full',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum ActivityType {
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  BADMINTON = 'badminton',
  TENNIS = 'tennis',
  SWIMMING = 'swimming',
  YOGA = 'yoga',
  FITNESS = 'fitness',
  OTHER = 'other'
}

/**
 * 活动实体
 * 存储活动信息的数据库实体
 */
@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 20 })
  type: ActivityType;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ length: 200 })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  currentParticipants: number;

  @Column({ default: 10 })
  maxParticipants: number;

  @Column({ length: 20, default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ActivityRegistration, registration => registration.activity)
  registrations: ActivityRegistration[];

  @OneToMany(() => ActivityComment, comment => comment.activity)
  comments: ActivityComment[];
}