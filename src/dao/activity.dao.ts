import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Like, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Activity, ActivityStatus, ActivityType } from '../filter/entity/activity.entity';

/**
 * 活动数据访问层
 * 处理活动相关的数据库操作
 */
@Provide()
export class ActivityDAO {
  @InjectEntityModel(Activity)
  activityRepository: Repository<Activity>;

  /**
   * 创建活动
   * @param activityData 活动数据
   * @returns 创建的活动实体
   */
  async create(activityData: Partial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(activityData);
    return await this.activityRepository.save(activity);
  }

  /**
   * 根据ID查询活动
   * @param id 活动ID
   * @returns 活动实体
   */
  async findById(id: number): Promise<Activity | null> {
    return await this.activityRepository.findOne({ 
      where: { id },
      relations: ['registrations', 'comments', 'comments.user']
    });
  }

  /**
   * 查询活动列表
   * @param query 查询参数
   * @returns 活动列表和总数
   */
  async findAll(query: {
    keyword?: string;
    type?: ActivityType;
    status?: ActivityStatus;
    startDate?: Date;
    endDate?: Date;
    page: number;
    limit: number;
  }): Promise<[Activity[], number]> {
    const where: any = {};

    if (query.keyword) {
      where.title = Like(`%${query.keyword}%`);
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate && query.endDate) {
      where.startTime = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      where.startTime = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      where.startTime = LessThanOrEqual(query.endDate);
    }

    return await this.activityRepository.findAndCount({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,   
      // 按ID升序排序
      order: { id: 'ASC' }
    });
  }

  /**
   * 更新活动信息
   * @param id 活动ID
   * @param updateData 更新数据
   * @returns 更新后的活动实体
   */
  async update(id: number, updateData: Partial<Activity>): Promise<Activity | null> {
    await this.activityRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * 删除活动
   * @param id 活动ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.activityRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * 增加当前参与人数
   * @param id 活动ID
   * @param increment 增量
   * @returns 是否更新成功
   */
  async incrementParticipants(id: number, increment: number = 1): Promise<boolean> {
    const result = await this.activityRepository
      .createQueryBuilder()
      .update(Activity)
      .set({ currentParticipants: () => `"currentParticipants" + ${increment}` })
      .where('id = :id', { id })
      .execute();
    return result.affected > 0;
  }

  /**
   * 减少当前参与人数
   * @param id 活动ID
   * @param decrement 减量
   * @returns 是否更新成功
   */
  async decrementParticipants(id: number, decrement: number = 1): Promise<boolean> {
    const result = await this.activityRepository
      .createQueryBuilder()
      .update(Activity)
      .set({ currentParticipants: () => `GREATEST("currentParticipants" - ${decrement}, 0)` })
      .where('id = :id', { id })
      .execute();
    return result.affected > 0;
  }
}