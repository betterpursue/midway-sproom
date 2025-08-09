import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { JWTUtil } from '../util/jwt.util';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      console.log('[Auth] 请求路径:', ctx.path, '方法:', ctx.method);
      console.log('[Auth] Authorization头:', ctx.headers.authorization ? '已提供' : '缺失');
      
      // 排除不需要认证的接口
      const excludePaths = [
        '/api/users/login', 
        '/api/users/register', 
        '/api/get_user'
      ];
      
      // GET请求的活动列表接口允许公开访问
      const publicGetPaths = [
        '/api/activities',
        /^\/api\/activities\/\d+$/
      ];
      
      // 登录和注册接口始终排除
      if (excludePaths.includes(ctx.path)) {
        console.log('[Auth] 跳过认证 - 公开接口');
        return await next();
      }
      
      // 允许GET请求的活动列表和详情接口公开访问
      if (ctx.method === 'GET') {
        const isPublicGet = publicGetPaths.some(path => {
          if (typeof path === 'string') {
            return ctx.path === path;
          }
          return path.test(ctx.path);
        });
        
        if (isPublicGet) {
          console.log('[Auth] 跳过认证 - 公开GET接口');
          return await next();
        }
      }

      const token = JWTUtil.extractTokenFromHeader(ctx.headers.authorization);
      if (!token) {
        console.warn('[Auth] 认证失败 - 缺少token');
        ctx.status = 401;
        ctx.body = { 
          message: '缺少token',
          timestamp: new Date().toISOString(),
          path: ctx.path
        };
        return;
      }

      try {
        console.log('[Auth] 开始验证token...');
        const payload = JWTUtil.verifyToken(token);
        console.log('[Auth] Token验证成功 - 用户:', payload.username);
        
        // 添加时间检查
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
          console.warn('[Auth] Token已过期');
          ctx.status = 401;
          ctx.body = { message: 'token已过期' };
          return;
        }
        
        ctx.state.user = payload;
        console.log('[Auth] 认证通过，用户信息:', { userId: payload.userId, username: payload.username });
        await next();
      } catch (error) {
        console.error('[Auth] Token验证失败:', error.message);
        ctx.status = 401;
        ctx.body = { 
          message: error.message || 'token无效或已过期',
          timestamp: new Date().toISOString(),
          path: ctx.path
        };
        return;
      }
    };
  }
}