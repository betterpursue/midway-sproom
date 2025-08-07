import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityComment } from '../filter/entity/activity-comment.entity';

/**
 * 活动评论数据访问层
 * 处理活动评论相关的数据库操作
 */
@Provide()
export class ActivityCommentDAO {
  @InjectEntityModel(ActivityComment)
  commentRepository: Repository<ActivityComment>;

  /**
   * 创建活动评论
   * @param commentData 评论数据
   * @returns 创建评论实体
   */
  async create(commentData: Partial<ActivityComment>): Promise<ActivityComment> {
    const comment = this.commentRepository.create(commentData);
    return await this.commentRepository.save(comment);
  }

  /**
   * 根据ID查询评论
   * @param id 评论ID
   * @returns 评论实体
   */
  async findById(id: number): Promise<ActivityComment | null> {
    return await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'activity']
    });
  }

  /**
   * 查询活动评论列表
   * @param activityId 活动ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 评论列表和总数
   */
  async findByActivityId(activityId: number, page: number = 1, limit: number = 10): Promise<[ActivityComment[], number]> {
    return await this.commentRepository.findAndCount({
      where: { activity: { id: activityId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 查询用户评论列表
   * @param userId 用户ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 评论列表和总数
   */
  async findByUserId(userId: number, page: number = 1, limit: number = 10): Promise<[ActivityComment[], number]> {
    return await this.commentRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['activity'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 计算活动平均评分
   * @param activityId 活动ID
   * @returns 平均评分
   */
  async calculateAverageRating(activityId: number): Promise<number> {
    const result = await this.commentRepository
      .createQueryBuilder('comment')
      .select('AVG(comment.rating)', 'avgRating')
      .where('comment.activityId = :activityId', { activityId })
      .getRawOne();
    
    return result?.avgRating ? parseFloat(result.avgRating) : 0;
  }

  /**
   * 检查用户是否已对活动评论
   * @param userId 用户ID
   * @param activityId 活动ID
   * @returns 是否已评论
   */
  async existsByUserAndActivity(userId: number, activityId: number): Promise<boolean> {
    const count = await this.commentRepository.count({
      where: {
        user: { id: userId },
        activity: { id: activityId }
      }
    });
    return count > 0;
  }

  /**
   * 删除评论
   * @param id 评论ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.commentRepository.delete(id);
    return result.affected > 0;
  }

  /**
   * 更新评论
   * @param id 评论ID
   * @param updateData 更新数据
   * @returns 更新后的评论实体
   */
  async update(id: number, updateData: Partial<ActivityComment>): Promise<ActivityComment | null> {
    await this.commentRepository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * 根据用户和活动ID获取评论
   * @param userId 用户ID
   * @param activityId 活动ID
   * @returns 评论实体
   */
  async findByUserAndActivity(userId: number, activityId: number): Promise<ActivityComment | null> {
    return await this.commentRepository.findOne({
      where: {
        user: { id: userId },
        activity: { id: activityId }
      },
      relations: ['user', 'activity']
    });
  }
}