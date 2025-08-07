import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  username: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

export class JWTUtil {
  private static readonly SECRET = process.env.JWT_SECRET || '1754275622272_5195';
  private static readonly TOKEN_EXPIRY = '24h'; // 延长到24小时
  private static readonly ISSUER = 'sports-room-api';

  static generateToken(payload: JWTPayload): string {
    console.log('[JWT] 生成token:', { 
      payload: { userId: payload.userId, username: payload.username }, 
      expiry: this.TOKEN_EXPIRY,
      issuer: this.ISSUER,
      timestamp: new Date().toISOString()
    });
    
    const token = jwt.sign(payload, this.SECRET, { 
      expiresIn: this.TOKEN_EXPIRY,
      issuer: this.ISSUER,
      algorithm: 'HS256'
    });
    
    console.log('[JWT] Token生成成功，长度:', token.length, '时间:', new Date().toISOString());
    return token;
  }

  static verifyToken(token: string): JWTPayload {
    try {
      console.log('[JWT] 开始验证token...');
      console.log('[JWT] Token长度:', token.length);
      
      // 检查服务器时间
      const serverTime = new Date().toISOString();
      console.log('[JWT] 服务器当前时间:', serverTime);
      
      const decoded = jwt.verify(token, this.SECRET, {
        issuer: this.ISSUER,
        algorithms: ['HS256']
      }) as JWTPayload;
      
      console.log('[JWT] Token验证成功:', {
        user: decoded.username,
        userId: decoded.userId,
        issuedAt: new Date(decoded.iat * 1000).toISOString(),
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
      
      return decoded;
    } catch (error) {
      console.error('[JWT] Token验证失败:', {
        error: error.name,
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      if (error.name === 'TokenExpiredError') {
        throw new Error(`token已过期，过期时间: ${new Date(error.expiredAt).toISOString()}`);
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error(`token格式无效: ${error.message}`);
      } else if (error.name === 'NotBeforeError') {
        throw new Error(`token尚未生效，生效时间: ${new Date(error.date).toISOString()}`);
      } else {
        throw new Error(`token验证失败: ${error.message}`);
      }
    }
  }

  static extractTokenFromHeader(authorization?: string): string | null {
    if (!authorization) {
      console.log('[JWT] Authorization头缺失');
      return null;
    }
    
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('[JWT] Authorization头格式错误:', authorization);
      return null;
    }
    
    console.log('[JWT] 成功提取token');
    return parts[1];
  }

  static getSecret(): string {
    return this.SECRET;
  }

  static getTokenExpiry(): string {
    return this.TOKEN_EXPIRY;
  }

  static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }
}