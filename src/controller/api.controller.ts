import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query('uid') uid: string) { // 明确指定参数类型
    // 验证uid参数是否存在且为数字
    if (!uid || isNaN(Number(uid))) {
      return { success: false, message: '缺少或无效的uid参数' };
    }
    
    const user = await this.userService.getUserById(Number(uid));
    
    // 检查用户是否存在
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    
    return { success: true, message: 'OK', data: user };
  }
}