import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../filter/entity/user.entity';

/**
 * 用户数据访问层
 * 处理用户相关的数据库操作
 */
@Provide()
export class UserDAO {
  @InjectEntityModel(User)
  userRepository: Repository<User>;

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户实体
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱地址
   * @returns 用户实体
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户实体
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建用户
   * @param userData 用户数据
   * @returns 创建后的用户实体
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateData 更新数据
   * @returns 更新后的用户实体
   */
  async update(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * 检查用户名是否存在
   * @param username 用户名
   * @returns 是否存在
   */
  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }

  /**
   * 检查邮箱是否存在
   * @param email 邮箱地址
   * @returns 是否存在
   */
  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }
}