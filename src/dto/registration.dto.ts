import { Rule, RuleType } from '@midwayjs/validate';
import { RegistrationStatus } from '../filter/entity/activity-registration.entity';

/**
 * 活动报名创建DTO
 */
export class CreateRegistrationDTO {
  @Rule(RuleType.number().integer().positive().required())
  activityId: number;

  @Rule(RuleType.string().max(200))
  notes?: string;
}

/**
 * 报名响应DTO
 */
export class RegistrationResponseDTO {
  id: number;
  orderNo: string;
  status: RegistrationStatus;
  amount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  activity: {
    id: number;
    title: string;
    type: string;
    startTime: Date;
    endTime: Date;
    location: string;
    price: number;
  };
  user: {
    id: number;
    username: string;
    realName?: string;
  };
}

/**
 * 报名查询参数DTO
 */
export class RegistrationQueryDTO {
  @Rule(RuleType.string().valid(...Object.values(RegistrationStatus)))
  status?: RegistrationStatus;

  @Rule(RuleType.number().min(1).default(1))
  page: number;

  @Rule(RuleType.number().min(1).max(100).default(10))
  limit: number;
}

/**
 * 更新报名状态DTO
 */
export class UpdateRegistrationStatusDTO {
  @Rule(RuleType.string().valid(...Object.values(RegistrationStatus)).required())
  status: RegistrationStatus;
}

/**
 * 更新报名信息DTO
 */
export class UpdateRegistrationDTO {
  @Rule(RuleType.string().max(200))
  notes?: string;
}