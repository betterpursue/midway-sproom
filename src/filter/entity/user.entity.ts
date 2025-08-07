import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ActivityRegistration } from './activity-registration.entity';
import { ActivityComment } from './activity-comment.entity';

/**
 * 用户角色枚举
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * 用户实体
 * 存储用户信息的数据库实体
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ length: 100 })
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 50, nullable: true })
  realName: string;

  @Column({ type: 'text', nullable: true })
  avatar: string;

  @Column({ default: 0 })
  creditPoints: number;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: UserRole.USER,
    comment: '用户角色: user 或 admin'
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ActivityRegistration, registration => registration.user)
  registrations: ActivityRegistration[];

  @OneToMany(() => ActivityComment, comment => comment.user)
  comments: ActivityComment[];
}