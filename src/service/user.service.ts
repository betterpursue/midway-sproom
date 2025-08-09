import { Provide, Inject } from '@midwayjs/core';
import { UserDAO } from '../dao/user.dao';
import { User } from '../filter/entity/user.entity';
import { RegisterUserDTO, LoginUserDTO, UserResponseDTO } from '../dto/user.dto';


/**
 * 用户服务
 * 处理用户相关的业务逻辑
 */
@Provide()
export class UserService {
  @Inject()
  userDAO: UserDAO;

  /**
   * 用户注册
   * @param registerData 注册数据
   * @returns 创建的用户
   */
  async register(registerData: RegisterUserDTO): Promise<UserResponseDTO> {
    // 检查用户名是否已存在
    if (await this.userDAO.existsByUsername(registerData.username)) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (await this.userDAO.existsByEmail(registerData.email)) {
      throw new Error('邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await this.hashPassword(registerData.password);

    // 创建用户
    const user = await this.userDAO.create({
      ...registerData,
      password: hashedPassword,
      creditPoints: 0
    });

    return this.toResponseDTO(user);
  }

  /**
   * 用户登录
   * @param loginData 登录数据
   * @returns 登录成功的用户
   */
  async login(loginData: LoginUserDTO): Promise<UserResponseDTO> {
    const { usernameOrEmail, password } = loginData;
    
    // 查找用户
    const user = usernameOrEmail.includes('@') 
      ? await this.userDAO.findByEmail(usernameOrEmail)
      : await this.userDAO.findByUsername(usernameOrEmail);

    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const bcrypt = await import('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('密码错误');
    }

    return this.toResponseDTO(user);
  }

  /**
   * 根据ID获取用户信息
   * @param id 用户ID
   * @returns 用户信息
   */
  async getUserById(id: number): Promise<UserResponseDTO | null> {
    const user = await this.userDAO.findById(id);
    return user ? this.toResponseDTO(user) : null;
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateData 更新数据
   * @returns 更新后的用户信息
   */
  async updateUser(id: number, updateData: Partial<Pick<User, 'realName' | 'phone' | 'avatar'>>): Promise<UserResponseDTO | null> {
    const user = await this.userDAO.update(id, updateData);
    return user ? this.toResponseDTO(user) : null;
  }

  // /**
  //  * 增加用户积分
  //  * @param id 用户ID
  //  * @param points 增加的积分
  //  * @returns 是否成功
  //  */
  // async addCreditPoints(id: number, points: number): Promise<boolean> {
  //   const user = await this.userDAO.findById(id);
  //   if (!user) {
  //     return false;
  //   }

  //   await this.userDAO.update(id, {
  //     creditPoints: user.creditPoints + points
  //   });
  //   return true;
  // }

  /**
   * 加密密码
   * @param password 原始密码
   * @returns 加密后的密码
   */
  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * 将用户实体转换为响应DTO
   * @param user 用户实体
   * @returns 用户响应DTO
   */
  private toResponseDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      phone: user.phone,
      avatar: user.avatar,
      creditPoints: user.creditPoints,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}