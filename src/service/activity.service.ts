import { Provide, Inject } from '@midwayjs/core';
import { ActivityDAO } from '../dao/activity.dao';
import { ActivityRegistrationDAO } from '../dao/activity-registration.dao';
import { ActivityCommentDAO } from '../dao/activity-comment.dao';
import { UserDAO } from '../dao/user.dao';

import { Activity, ActivityStatus } from '../filter/entity/activity.entity';
import { ActivityComment } from '../filter/entity/activity-comment.entity';
import { CreateActivityDTO, UpdateActivityDTO, ActivityQueryDTO, ActivityResponseDTO, ActivityDetailDTO, CreateCommentDTO, ActivityCommentDTO } from '../dto/activity.dto';


/**
 * 活动服务
 * 处理活动相关的业务逻辑
 */
@Provide()
export class ActivityService {
  @Inject()
  activityDAO: ActivityDAO;

  @Inject()
  activityRegistrationDAO: ActivityRegistrationDAO;

  @Inject()
  activityCommentDAO: ActivityCommentDAO;

  @Inject()
  userDAO: UserDAO;



  /**
   * 创建活动
   * @param createData 活动创建数据
   * @returns 活动响应数据
   */
  async createActivity(createData: CreateActivityDTO): Promise<ActivityResponseDTO> {
    // 验证时间
    if (createData.startTime >= createData.endTime) {
      throw new Error('开始时间必须早于结束时间');
    }

    if (createData.startTime < new Date()) {
      throw new Error('开始时间不能早于当前时间');
    }

    // 创建活动
    const activity = await this.activityDAO.create({
      ...createData,
      status: ActivityStatus.OPEN
    });

    return this.toResponseDTO(activity);
  }

  /**
   * 更新活动
   * @param id 活动ID
   * @param updateData 活动更新数据
   * @returns 活动响应数据
   */
  async updateActivity(id: number, updateData: UpdateActivityDTO): Promise<ActivityResponseDTO | null> {
    const activity = await this.activityDAO.findById(id);
    if (!activity) {
      throw new Error('活动不存在');
    }

    // 验证时间
    if (updateData.startTime && updateData.endTime && updateData.startTime >= updateData.endTime) {
      throw new Error('开始时间必须早于结束时间');
    }

    if (updateData.startTime && updateData.startTime < new Date()) {
      throw new Error('开始时间不能早于当前时间');
    }

    const updatedActivity = await this.activityDAO.update(id, updateData);
    return updatedActivity ? this.toResponseDTO(updatedActivity) : null;
  }

  /**
   * 删除活动
   * @param id 活动ID
   * @returns 删除结果
   */
  async deleteActivity(id: number): Promise<boolean> {
    const activity = await this.activityDAO.findById(id);
    if (!activity) {
      throw new Error('活动不存在');
    }

    // 检查是否有报名用户
    const registrations = await this.activityRegistrationDAO.findByActivityId(id);
    if (registrations[0].length > 0) {
      throw new Error('该活动已有用户报名，无法删除');
    }

    return await this.activityDAO.delete(id);
  }

  /**
   * 获取活动列表
   * @param query 查询参数
   * @returns 活动列表和总数
   */
  async getActivityList(query: ActivityQueryDTO): Promise<{ activities: ActivityResponseDTO[]; total: number }> {
    const [activities, total] = await this.activityDAO.findAll(query);
    return {
      activities: activities.map(activity => this.toResponseDTO(activity)),
      total
    };
  }

  /**
   * 获取活动详情
   * @param id 活动ID
   * @returns 活动详情
   */
  async getActivityDetail(id: number): Promise<ActivityDetailDTO | null> {
    const activity = await this.activityDAO.findById(id);
    if (!activity) {
      return null;
    }

    const comments = await this.activityCommentDAO.findByActivityId(id, 1, 50);
    
    return {
      ...this.toResponseDTO(activity),
      comments: comments[0].map(comment => this.toCommentDTO(comment))
    };
  }

  /**
   * 创建或更新活动评论
   * @param activityId 活动ID
   * @param userId 用户ID
   * @param commentData 评论数据
   * @returns 评论响应数据
   */
  async createComment(activityId: number, userId: number, commentData: CreateCommentDTO): Promise<ActivityCommentDTO> {
    // 检查用户是否已报名该活动
    const hasRegistered = await this.activityRegistrationDAO.existsByUserAndActivity(userId, activityId);
    if (!hasRegistered) {
      throw new Error('您必须先报名此活动才能评论');
    }

    const activityEntity = await this.activityDAO.findById(activityId);
    if (!activityEntity) {
      throw new Error('活动不存在');
    }

    const userEntity = await this.userDAO.findById(userId);
    if (!userEntity) {
      throw new Error('用户不存在');
    }

    // 检查用户是否已经评论过
    const existingComment = await this.activityCommentDAO.findByUserAndActivity(userId, activityId);
    
    let comment: ActivityComment;
    if (existingComment) {
      // 更新现有评论
      comment = await this.activityCommentDAO.update(existingComment.id, {
        content: commentData.content,
        rating: commentData.rating
      });
    } else {
      // 创建新评论
      comment = await this.activityCommentDAO.create({
        ...commentData,
        activity: activityEntity,
        user: userEntity
      });
    }

    return this.toCommentDTO(comment);
  }

  /**
   * 更新用户评论
   * @param activityId 活动ID
   * @param userId 用户ID
   * @param commentData 评论数据
   * @returns 评论响应数据
   */
  async updateComment(activityId: number, userId: number, commentData: CreateCommentDTO): Promise<ActivityCommentDTO> {
    const existingComment = await this.activityCommentDAO.findByUserAndActivity(userId, activityId);
    if (!existingComment) {
      throw new Error('您还没有评论过此活动');
    }

    const comment = await this.activityCommentDAO.update(existingComment.id, {
      content: commentData.content,
      rating: commentData.rating
    });

    return this.toCommentDTO(comment);
  }

  /**
   * 将活动实体转换为响应DTO
   * @param activity 活动实体
   * @returns 活动响应DTO
   */
  private toResponseDTO(activity: Activity): ActivityResponseDTO {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location,
      currentParticipants: activity.currentParticipants,
      maxParticipants: activity.maxParticipants,
      status: activity.status,
      imageUrl: activity.imageUrl,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
    };
  }

  /**
   * 获取活动的评论列表
   * @param activityId 活动ID
   * @param page 页码
   * @param limit 每页数量
   * @returns 评论列表和总数
   */
  async getActivityComments(activityId: number, page: number, limit: number): Promise<{ comments: ActivityCommentDTO[]; total: number }> {
    const [comments, total] = await this.activityCommentDAO.findByActivityId(activityId, page, limit);
    
    return {
      comments: comments.map(comment => this.toCommentDTO(comment)),
      total
    };
  }

  /**
   * 将评论实体转换为响应DTO
   * @param comment 评论实体
   * @returns 评论响应DTO
   */
  private toCommentDTO(comment: ActivityComment): ActivityCommentDTO {
    return {
      id: comment.id,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatar: comment.user.avatar
      },
      rating: comment.rating,
      content: comment.content,
      createdAt: comment.createdAt
    };
  }
}