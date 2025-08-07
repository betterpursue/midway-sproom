import { Rule, RuleType } from '@midwayjs/validate';
import { ActivityType, ActivityStatus } from '../filter/entity/activity.entity';

/**
 * 创建活动数据DTO
 */
export class CreateActivityDTO {
  @Rule(RuleType.string().min(2).max(100).required())
  title: string;

  @Rule(RuleType.string().min(10).max(1000).required())
  description: string;

  @Rule(RuleType.string().valid(...Object.values(ActivityType)).required())
  type: ActivityType;

  @Rule(RuleType.date().required())
  startTime: Date;

  @Rule(RuleType.date().min(RuleType.ref('startTime')).required())
  endTime: Date;

  @Rule(RuleType.string().min(2).max(200).required())
  location: string;

  @Rule(RuleType.number().min(0).required())
  price: number;

  @Rule(RuleType.number().min(1).max(100).required())
  maxParticipants: number;

  @Rule(RuleType.string().uri())
  imageUrl?: string;
}

/**
 * 更新活动数据DTO
 */
export class UpdateActivityDTO {
  @Rule(RuleType.string().min(2).max(100))
  title?: string;

  @Rule(RuleType.string().min(10).max(1000))
  description?: string;

  @Rule(RuleType.string().valid(...Object.values(ActivityType)))
  type?: ActivityType;

  @Rule(RuleType.date())
  startTime?: Date;

  @Rule(RuleType.date().min(RuleType.ref('startTime')))
  endTime?: Date;

  @Rule(RuleType.string().min(2).max(200))
  location?: string;

  @Rule(RuleType.number().min(0))
  price?: number;

  @Rule(RuleType.number().min(1).max(100))
  maxParticipants?: number;

  @Rule(RuleType.string().valid(...Object.values(ActivityStatus)))
  status?: ActivityStatus;

  @Rule(RuleType.string().uri())
  imageUrl?: string;
}

/**
 * 活动查询参数DTO
 */
export class ActivityQueryDTO {
  @Rule(RuleType.string())
  keyword?: string;

  @Rule(RuleType.string().valid(...Object.values(ActivityType)))
  type?: ActivityType;

  @Rule(RuleType.string().valid(...Object.values(ActivityStatus)))
  status?: ActivityStatus;

  @Rule(RuleType.date())
  startDate?: Date;

  @Rule(RuleType.date())
  endDate?: Date;

  @Rule(RuleType.number().min(1).default(1))
  page: number;

  @Rule(RuleType.number().min(1).max(100).default(10))
  limit: number;
}

/**
 * 活动响应DTO
 */
export class ActivityResponseDTO {
  id: number;
  title: string;
  description: string;
  type: ActivityType;
  startTime: Date;
  endTime: Date;
  location: string;
  price: number;
  currentParticipants: number;
  maxParticipants: number;
  status: ActivityStatus;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 活动详情响应DTO
 */
export class ActivityDetailDTO extends ActivityResponseDTO {
  comments: ActivityCommentDTO[];
}

/**
 * 活动评论DTO
 */
export class ActivityCommentDTO {
  id: number;
  user: {
    id: number;
    username: string;
    avatar?: string;
  };
  rating: number;
  content: string;
  createdAt: Date;
}

/**
 * 创建评论数据DTO
 */
export class CreateCommentDTO {
  @Rule(RuleType.number().min(1).max(5).required())
  rating: number;

  @Rule(RuleType.string().min(5).max(500).required())
  content: string;
}