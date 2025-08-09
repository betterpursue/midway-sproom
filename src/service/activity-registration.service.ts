import { Provide, Inject } from '@midwayjs/core';
import { ActivityRegistrationDAO } from '../dao/activity-registration.dao';
import { ActivityDAO } from '../dao/activity.dao';
import { UserDAO } from '../dao/user.dao';
import { ActivityRegistration, RegistrationStatus } from '../filter/entity/activity-registration.entity';
import { CreateRegistrationDTO, RegistrationResponseDTO, RegistrationQueryDTO } from '../dto/registration.dto';
import { ActivityStatus } from '../filter/entity/activity.entity';

/**
 * 活动报名服务
 * 处理活动报名的业务逻辑，包括创建、查询、更新和取消报名等操作
 */
@Provide()
export class ActivityRegistrationService {
  @Inject()
  registrationDAO: ActivityRegistrationDAO;

  @Inject()
  activityDAO: ActivityDAO;

  @Inject()
  userDAO: UserDAO;

  /**
   * 创建或更新活动报名
   * @param createData 创建报名数据
   * @param userId 用户ID
   * @returns 报名响应数据
   */
  async createRegistration(createData: CreateRegistrationDTO, userId: number): Promise<RegistrationResponseDTO> {
    const { activityId, notes } = createData;

    // 检查用户是否存在
    const user = await this.userDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 检查活动是否存在
    const activity = await this.activityDAO.findById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }

    // 检查活动状态
    if (activity.status !== ActivityStatus.OPEN) {
      throw new Error('活动未开放报名');
    }

    // 检查是否已报名
    const existingRegistration = await this.registrationDAO.findByUserAndActivity(userId, activityId);
    if (existingRegistration) {
      // 如果已报名，返回现有报名信息
      return this.toResponseDTO(existingRegistration);
    }

    // 检查活动人数限制
    if (activity.currentParticipants >= activity.maxParticipants) {
      throw new Error('活动人数已满');
    }

    // 创建活动报名记录
    const registration = await this.registrationDAO.create({
      user,
      activity,
      status: RegistrationStatus.PENDING,
      notes
    });

    // 增加活动当前参与人数
    await this.activityDAO.incrementParticipants(activityId);

    return this.toResponseDTO(registration);
  }

  /**
   * 更新报名信息
   * @param activityId 活动ID
   * @param updateData 更新数据
   * @param userId 用户ID
   * @returns 更新后的报名响应数据
   */
  async updateRegistration(activityId: number, updateData: { notes?: string }, userId: number): Promise<RegistrationResponseDTO> {
    // 查找现有报名记录
    const registration = await this.registrationDAO.findByUserAndActivity(userId, activityId);
    if (!registration) {
      throw new Error('您尚未报名此活动');
    }

    // 检查是否可以更新（只允许更新待确认状态的报名）
    // 由于现在直接删除报名记录，此检查不再需要

    // 更新报名信息
    const updatedRegistration = await this.registrationDAO.updateRegistration(registration.id, updateData);
    return this.toResponseDTO(updatedRegistration);
  }

  /**
   * 获取用户的报名记录
   * @param userId 用户ID
   * @param query 查询参数
   * @returns 报名记录列表和总数
   */
  async getUserRegistrations(userId: number, query: RegistrationQueryDTO): Promise<{ registrations: RegistrationResponseDTO[]; total: number }> {
    const [registrations, total] = await this.registrationDAO.findByUserId(userId, query.page, query.limit);
    return {
      registrations: registrations.map(registration => this.toResponseDTO(registration)),
      total
    };
  }

  /**
   * 获取活动的报名列表
   * @param activityId 活动ID
   * @param query 查询参数
   * @returns 报名记录列表和总数
   */
  async getActivityRegistrations(activityId: number, query: RegistrationQueryDTO): Promise<{ registrations: RegistrationResponseDTO[]; total: number }> {
    // 检查活动是否存在
    const activity = await this.activityDAO.findById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }

    const [registrations, total] = await this.registrationDAO.findByActivityId(activityId, query.page, query.limit);
    return {
      registrations: registrations.map(registration => this.toResponseDTO(registration)),
      total
    };
  }





  /**
   * 更新报名状态（管理员专用）
   * @param registrationId 报名ID
   * @param newStatus 新状态
   * @returns 更新后的报名响应数据
   */
  async updateRegistrationStatus(registrationId: number, newStatus: string): Promise<RegistrationResponseDTO> {
    const registration = await this.registrationDAO.findById(registrationId);
    if (!registration) {
      throw new Error('报名记录不存在');
    }

    // 使用repository的update方法直接更新
    await this.registrationDAO.registrationRepository.update(registrationId, {
      status: newStatus as RegistrationStatus,
      updatedAt: new Date()
    });
    
    // 重新获取更新后的记录
    const updatedRegistration = await this.registrationDAO.findById(registrationId);
    return this.toResponseDTO(updatedRegistration);
  }

  /**
   * 删除报名记录
   * @param registrationId 报名ID
   * @param userId 用户ID
   * @returns 是否删除成功
   */
  async deleteRegistration(registrationId: number, userId: number): Promise<boolean> {
    const registration = await this.registrationDAO.findById(registrationId);
    if (!registration) {
      throw new Error('报名记录不存在');
    }

    // 获取用户信息以验证权限
    const user = await this.userDAO.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证用户权限 - 普通用户只能删除自己的记录，管理员可以删除任何记录
    const registrationUserId = Number(registration.user.id);
    const currentUserId = Number(userId);
    
    if (registrationUserId !== currentUserId && user.role !== 'admin') {
      throw new Error('您无权删除此报名记录');
    }

    // 检查报名状态 - 已确认的状态不能取消报名（管理员除外）
    if (registration.status === RegistrationStatus.CONFIRMED && user.role !== 'admin') {
      throw new Error('报名信息已确认，无法取消报名');
    }

    // 减少活动参与人数
    await this.activityDAO.decrementParticipants(registration.activity.id);

    // 删除报名记录
    const deleted = await this.registrationDAO.deleteById(registrationId);
    return deleted;
  }



  /**
   * 将报名实体转换为响应DTO
   * @param registration 报名实体
   * @returns 响应DTO
   */
  private toResponseDTO(registration: ActivityRegistration): RegistrationResponseDTO {
    return {
      id: registration.id,
      status: registration.status,
      notes: registration.notes,
      updatedAt: registration.updatedAt,
      activity: {
        id: registration.activity.id,
        title: registration.activity.title,
        type: registration.activity.type,
        startTime: registration.activity.startTime,
        endTime: registration.activity.endTime,
        location: registration.activity.location,
        imageUrl: registration.activity.imageUrl
      },
      user: {
        id: registration.user.id,
        username: registration.user.username,
        realName: registration.user.realName,
        phone: registration.user.phone,
        email: registration.user.email
      }
    };
  }
}