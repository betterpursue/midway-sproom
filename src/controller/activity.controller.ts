import { Controller, Post, Get, Put, Del, Body, Query, Param, Inject } from '@midwayjs/core';
import { ActivityService } from '../service/activity.service';
import { UserService } from '../service/user.service';
import { CreateActivityDTO, UpdateActivityDTO, ActivityQueryDTO, ActivityResponseDTO, ActivityDetailDTO, CreateCommentDTO } from '../dto/activity.dto';
import { Context } from '@midwayjs/koa';
import { UserRole } from '../filter/entity/user.entity';

/**
 * 活动控制器
 * 处理活动相关的HTTP请求
 */
@Controller('/api/activities')
export class ActivityController {
  @Inject()
  activityService: ActivityService;

  @Inject()
  userService: UserService;

  @Inject()
  ctx: Context;

  /**
   * 创建活动
   * 需要管理员权限
   */
  @Post('/')
  async createActivity(@Body() createData: CreateActivityDTO): Promise<ActivityResponseDTO> {
    // 检查用户是否为管理员
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录');
    }

    const user = await this.userService.getUserById(userId);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new Error('需要管理员权限才能创建活动');
    }

    return await this.activityService.createActivity(createData);
  }

  /**
   * 获取活动列表
   */
  @Get('/')
  async getActivityList(@Query() query: ActivityQueryDTO): Promise<{ activities: ActivityResponseDTO[]; total: number }> {
    return await this.activityService.getActivityList(query);
  }

  /**
   * 获取活动详情
   */
  @Get('/:id')
  async getActivityDetail(@Param('id') id: string): Promise<ActivityDetailDTO | null> {
    const activity = await this.activityService.getActivityDetail(parseInt(id));
    if (!activity) {
      throw new Error('活动不存在');
    }
    return activity;
  }

  /**
   * 更新活动
   * 需要管理员权限
   */
  @Put('/:id')
  async updateActivity(@Param('id') id: string, @Body() updateData: UpdateActivityDTO): Promise<ActivityResponseDTO | null> {
    // 检查用户是否为管理员
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录');
    }

    const user = await this.userService.getUserById(userId);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new Error('需要管理员权限才能更新活动');
    }

    const activity = await this.activityService.updateActivity(parseInt(id), updateData);
    if (!activity) {
      throw new Error('活动不存在');
    }
    return activity;
  }

  /**
   * 删除活动
   * 需要管理员权限
   */
  @Del('/:id')
  async deleteActivity(@Param('id') id: string): Promise<{ success: boolean }> {
    // 检查用户是否为管理员
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录');
    }

    const user = await this.userService.getUserById(userId);
    if (!user || user.role !== UserRole.ADMIN) {
      throw new Error('需要管理员权限才能删除活动');
    }

    const success = await this.activityService.deleteActivity(parseInt(id));
    return { success };
  }

  /**
   * 创建或更新活动评论
   */
  @Post('/:id/comments')
  async createComment(
    @Param('id') id: string, 
    @Body() commentData: CreateCommentDTO
  ): Promise<any> {
    // 从中间件中获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录');
    }

    const comment = await this.activityService.createComment(parseInt(id), userId, commentData);
    return comment;
  }

  /**
   * 更新活动评论
   */
  @Put('/:id/comments')
  async updateComment(
    @Param('id') id: string, 
    @Body() commentData: CreateCommentDTO
  ): Promise<any> {
    // 从中间件中获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录');
    }

    const comment = await this.activityService.updateComment(parseInt(id), userId, commentData);
    return comment;
  }

  /**
   * 获取活动的评论列表
   */
  @Get('/:id/comments')
  async getComments(@Param('id') id: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10'): Promise<any> {
    const activityId = parseInt(id);
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    // 检查活动是否存在
    const activity = await this.activityService.getActivityDetail(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }
    
    // 获取评论列表
    const comments = await this.activityService.getActivityComments(activityId, pageNum, limitNum);
    
    return {
      comments: comments.comments,
      total: comments.total,
      page: pageNum,
      limit: limitNum
    };
  }
}