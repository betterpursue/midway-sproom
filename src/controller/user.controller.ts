import { Controller, Post, Get, Put, Body, Param, Inject } from '@midwayjs/core';
import { UserService } from '../service/user.service';
import { RegisterUserDTO, LoginUserDTO, UserResponseDTO, LoginResponseDTO } from '../dto/user.dto';
import { Context } from '@midwayjs/koa';

/**
 * 用户控制器
 * 处理用户相关的HTTP请求
 */
@Controller('/api/users')
export class UserController {
  @Inject()
  userService: UserService;

  @Inject()
  ctx: Context;

  /**
   * 用户注册
   */
  @Post('/register')
  async register(@Body() registerData: RegisterUserDTO): Promise<UserResponseDTO> {
    const user = await this.userService.register(registerData);
    return user;
  }

  /**
   * 用户登录
   */
  @Post('/login')
  async login(@Body() loginData: LoginUserDTO): Promise<LoginResponseDTO> {
    const user = await this.userService.login(loginData);
    
    // 生成JWT token
    const { JWTUtil } = await import('../util/jwt.util');
    const token = JWTUtil.generateToken({ userId: user.id, username: user.username });
    
    return {
      user,
      token
    };
  }

  /**
   * 获取当前用户信息
   */
  @Get('/me')
  async getCurrentUser(): Promise<UserResponseDTO | null> {
    // 从中间件中获取用户ID
    const user = this.ctx.state.user as { userId: number; username: string };
    if (!user || !user.userId) {
      throw new Error('用户未登录');
    }
    return await this.userService.getUserById(user.userId);
  }

  /**
   * 更新当前用户信息
   */
  @Put('/me')
  async updateCurrentUser(@Body() updateData: Partial<Pick<UserResponseDTO, 'realName' | 'phone' | 'avatar'>>): Promise<UserResponseDTO | null> {
    // 从中间件中获取用户ID
    const user = this.ctx.state.user as { userId: number; username: string };
    if (!user || !user.userId) {
      throw new Error('用户未登录');
    }
    return await this.userService.updateUser(user.userId, updateData);
  }

  /**
   * 根据ID获取用户信息
   */
  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<UserResponseDTO | null> {
    const userId = parseInt(id);
    if (isNaN(userId)) {
      throw new Error('用户ID必须是有效的数字');
    }
    return await this.userService.getUserById(userId);
  }
}