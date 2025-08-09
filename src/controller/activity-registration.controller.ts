import { Controller, Post, Get, Put, Del, Body, Query, Param, Inject } from '@midwayjs/core';
import { ActivityRegistrationService } from '../service/activity-registration.service';
import { ActivityRegistrationDAO } from '../dao/activity-registration.dao';
import { CreateRegistrationDTO, RegistrationQueryDTO, UpdateRegistrationDTO } from '../dto/registration.dto';
import { Context } from '@midwayjs/koa';

/**
 * 活动报名控制器
 * 处理活动报名的HTTP请求
 */
@Controller('/api/registrations')
export class ActivityRegistrationController {
  @Inject()
  registrationDAO: ActivityRegistrationDAO;

  @Inject()
  registrationService: ActivityRegistrationService;

  @Inject()
  ctx: Context;

  /**
   * 创建活动报名
   */
  @Post('/')
  async createRegistration(@Body() createData: CreateRegistrationDTO): Promise<any> {
    // 从认证中间件获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录或用户信息无效');
    }

    const registration = await this.registrationService.createRegistration(createData, userId);
    return registration;
  }

  /**
   * 获取我的报名记录
   */
  @Get('/my')
  async getMyRegistrations(@Query() query: RegistrationQueryDTO): Promise<any> {
    // 从认证中间件获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录或用户信息无效');
    }

    return await this.registrationService.getUserRegistrations(userId, query);
  }

  /**
   * 获取活动的报名列表
   */
  @Get('/activity/:id')
  async getActivityRegistrations(
    @Param('id') id: string,
    @Query() query: RegistrationQueryDTO
  ): Promise<any> {
    const activityId = parseInt(id);
    return await this.registrationService.getActivityRegistrations(activityId, query);
  }





  /**
   * 更新报名信息
   */
  @Put('/activity/:id')
  async updateRegistration(
    @Param('id') id: string,
    @Body() updateData: UpdateRegistrationDTO
  ): Promise<any> {
    const activityId = parseInt(id);
    
    // 从认证中间件获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      throw new Error('用户未登录或用户信息无效');
    }

    const registration = await this.registrationService.updateRegistration(activityId, updateData, userId);
    return registration;
  }

  /**
   * 更新报名状态（管理员专用）
   */
  @Put('/:id/status')
  async updateRegistrationStatus(
    @Param('id') id: string,
    @Body() statusData: { status: string }
  ): Promise<any> {
    const registrationId = parseInt(id);
    const { status } = statusData;
    
    // 验证状态值
    const validStatuses = ['PENDING', 'CONFIRMED'];
    if (!validStatuses.includes(status)) {
      throw new Error('无效的状态值');
    }
    
    const registration = await this.registrationService.updateRegistrationStatus(registrationId, status);
    return registration;
  }

  /**
   * 根据ID获取报名详情
   */
  @Get('/:id')
  async getRegistrationById(@Param('id') id: string): Promise<any> {
    const registrationId = parseInt(id);
    const registration = await this.registrationDAO.findById(registrationId);
    if (!registration) {
      throw new Error('报名记录不存在');
    }
    return registration;
  }

  /**
   * 删除报名记录
   */
  @Del('/:id/delete')
  async deleteRegistration(@Param('id') id: string): Promise<{ success: boolean }> {
    const registrationId = parseInt(id);
    
    // 从认证中间件获取用户ID
    const userId = this.ctx.state.user?.userId;
    if (!userId) {
      console.error('[Controller] 用户未认证，ctx.state.user:', this.ctx.state.user);
      throw new Error('用户未认证');
    }

    console.log('[Controller] 删除报名请求，用户ID:', userId, '报名ID:', id);
    const success = await this.registrationService.deleteRegistration(registrationId, userId);
    return { success };
  }
}