import { Provide, Inject } from '@midwayjs/core';
import { ActivityRegistrationDAO } from '../dao/activity-registration.dao';
import { ActivityDAO } from '../dao/activity.dao';
import { UserDAO } from '../dao/user.dao';
import { ActivityRegistration, RegistrationStatus } from '../filter/entity/activity-registration.entity';
import { CreateRegistrationDTO, RegistrationResponseDTO, RegistrationQueryDTO, UpdateRegistrationStatusDTO } from '../dto/registration.dto';
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

    // 生成订单号
    const orderNo = this.generateOrderNo();

    // 创建活动报名记录
    const registration = await this.registrationDAO.create({
      user,
      activity,
      orderNo,
      amount: activity.price,
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
    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new Error('已取消的报名无法更新');
    }

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
    const [registrations, total] = await this.registrationDAO.findByUserId(userId, query.status, query.page, query.limit);
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

    const [registrations, total] = await this.registrationDAO.findByActivityId(activityId, query.status, query.page, query.limit);
    return {
      registrations: registrations.map(registration => this.toResponseDTO(registration)),
      total
    };
  }

  /**
   * 更新报名状态
   * @param registrationId 报名ID
   * @param statusData 状态数据
   * @param userId 操作用户ID（预留用于权限校验）
   * @returns 更新后的报名数据
   */
  async updateRegistrationStatus(registrationId: number, statusData: UpdateRegistrationStatusDTO, userId: number): Promise<RegistrationResponseDTO | null> {
    const registration = await this.registrationDAO.findById(registrationId);
    if (!registration) {
      throw new Error('报名记录不存在');
    }

    // TODO: 添加权限校验逻辑
    // 需要验证用户是否有权限更新此报名状态
    
    const updatedRegistration = await this.registrationDAO.updateStatus(registrationId, statusData.status);
    return updatedRegistration ? this.toResponseDTO(updatedRegistration) : null;
  }

  /**
   * 取消报名
   * @param registrationId 报名ID
   * @param userId 用户ID
   * @returns 是否取消成功
   */
  async cancelRegistration(registrationId: number, userId: number): Promise<boolean> {
    const registration = await this.registrationDAO.findById(registrationId);
    if (!registration) {
      throw new Error('报名记录不存在');
    }

    // 验证用户权限
    if (registration.user.id !== userId) {
      throw new Error('您无权取消他人的报名');
    }

    // 检查状态
    if (registration.status === RegistrationStatus.PAID) {
      throw new Error('已支付的报名无法取消，请联系客服');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new Error('报名已取消');
    }

    // 更新状态
    await this.registrationDAO.updateStatus(registrationId, RegistrationStatus.CANCELLED);

    // 减少活动参与人数
    await this.activityDAO.decrementParticipants(registration.activity.id);

    return true;
  }

  /**
   * 生成订单号
   * @returns 订单号字符串
   */
  private generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `ORD${timestamp}${random}`;
  }

  /**
   * 将报名实体转换为响应DTO
   * @param registration 报名实体
   * @returns 响应DTO
   */
  private toResponseDTO(registration: ActivityRegistration): RegistrationResponseDTO {
    return {
      id: registration.id,
      orderNo: registration.orderNo,
      status: registration.status,
      amount: registration.amount,
      notes: registration.notes,
      createdAt: registration.createdAt,
      updatedAt: registration.updatedAt,
      activity: {
        id: registration.activity.id,
        title: registration.activity.title,
        type: registration.activity.type,
        startTime: registration.activity.startTime,
        endTime: registration.activity.endTime,
        location: registration.activity.location,
        price: registration.activity.price
      },
      user: {
        id: registration.user.id,
        username: registration.user.username,
        realName: registration.user.realName
      }
    };
  }
}