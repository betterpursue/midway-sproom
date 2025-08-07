import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 注册用户数据传输对象
 */
export class RegisterUserDTO {
  @Rule(RuleType.string().min(3).max(50).required())
  username: string;

  @Rule(RuleType.string().email().required())
  email: string;

  @Rule(RuleType.string().min(6).max(100).required())
  password: string;

  @Rule(RuleType.string().min(2).max(50))
  realName?: string;

  @Rule(RuleType.string().pattern(/^1[3-9]\d{9}$/))
  phone?: string;
}

/**
 * 登录用户数据传输对象
 */
export class LoginUserDTO {
  @Rule(RuleType.string().required())
  usernameOrEmail: string;

  @Rule(RuleType.string().required())
  password: string;
}

/**
 * 用户信息响应数据传输对象
 */
export class UserResponseDTO {
  id: number;
  username: string;
  email: string;
  realName?: string;
  phone?: string;
  avatar?: string;
  creditPoints: number;
  role: string;
  createdAt: Date;
}

/**
 * 登录响应数据传输对象
 */
export class LoginResponseDTO {
  user: UserResponseDTO;
  token: string;
}