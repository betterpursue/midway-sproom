import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * 活动报名实体
 * 存储用户活动报名信息
 */
@Entity('activity_registrations')
export class ActivityRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.registrations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Activity, activity => activity.registrations)
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column({ length: 50 })
  orderNo: string;

  @Column({ length: 20, default: RegistrationStatus.PENDING })
  status: RegistrationStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}