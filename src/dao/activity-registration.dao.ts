import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import {
  ActivityRegistration,
} from '../filter/entity/activity-registration.entity';

/**
 * 活动报名数据访问对象
 * 处理活动报名相关的数据库操作
 */
@Provide()
export class ActivityRegistrationDAO {
  @InjectEntityModel(ActivityRegistration)
  registrationRepository: Repository<ActivityRegistration>;

  /**
   * 创建活动报名
   * @param registrationData 报名信息
   * @returns 创建的报名实体
   */
  async create(
    registrationData: Partial<ActivityRegistration>
  ): Promise<ActivityRegistration> {
    const registration = this.registrationRepository.create(registrationData);
    return await this.registrationRepository.save(registration);
  }

  /**
   * 根据ID查询报名记录
   * @param id 报名ID
   * @returns 报名实体
   */
  async findById(id: number): Promise<ActivityRegistration | null> {
    return await this.registrationRepository.findOne({
      where: { id },
      relations: ['user', 'activity'],
    });
  }



  /**
   * 查询用户的报名记录
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 报名列表和总数
   */
  async findByUserId(
    userId: number,
    page = 1,
    limit = 10
  ): Promise<[ActivityRegistration[], number]> {
    return await this.registrationRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user', 'activity'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 查询活动的报名记录
   * @param activityId 活动ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 报名列表和总数
   */
  async findByActivityId(
    activityId: number,
    page = 1,
    limit = 10
  ): Promise<[ActivityRegistration[], number]> {
    return await this.registrationRepository.findAndCount({
      where: { activity: { id: activityId } },
      relations: ['user', 'activity'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 检查用户是否已报名活动
   * @param userId 用户ID
   * @param activityId 活动ID
   * @returns 是否已报名
   */
  async existsByUserAndActivity(
    userId: number,
    activityId: number
  ): Promise<boolean> {
    const count = await this.registrationRepository.count({
      where: {
        user: { id: userId },
        activity: { id: activityId },
      },
    });
    return count > 0;
  }



  /**
   * 根据用户和活动ID查找报名记录
   * @param userId 用户ID
   * @param activityId 活动ID
   * @returns 报名实体
   */
  async findByUserAndActivity(userId: number, activityId: number): Promise<ActivityRegistration | null> {
    return await this.registrationRepository.findOne({
      where: {
        user: { id: userId },
        activity: { id: activityId },
      },
      relations: ['user', 'activity'],
    });
  }

  /**
   * 更新报名信息
   * @param id 报名ID
   * @param updateData 更新数据
   * @returns 更新后的报名实体
   */
  async updateRegistration(
    id: number,
    updateData: { notes?: string }
  ): Promise<ActivityRegistration | null> {
    await this.registrationRepository.update(id, updateData);
    return await this.findById(id);
  }



  /**
   * 删除报名记录
   * @param id 报名ID
   * @returns 是否删除成功
   */
  async deleteById(id: number): Promise<boolean> {
    const result = await this.registrationRepository.delete(id);
    return result.affected > 0;
  }
}