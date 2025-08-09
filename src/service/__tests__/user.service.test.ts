import { UserService } from '../user.service';
import { UserDAO } from '../../dao/user.dao';
import { RegisterUserDTO, LoginUserDTO } from '../../dto/user.dto';

// 使用jest.spyOn来mock UserService的私有方法
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn()
}));

describe('UserService', () => {
  let userService: UserService;
  let userDAO: UserDAO;

  beforeEach(() => {
    userDAO = {
      existsByUsername: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
      findByUsername: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    userService = new UserService();
    (userService as any).userDAO = userDAO;

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const registerData: RegisterUserDTO = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '13800138000'
      };

      jest.spyOn(userDAO, 'existsByUsername').mockResolvedValue(false);
      jest.spyOn(userDAO, 'existsByEmail').mockResolvedValue(false);
      jest.spyOn(userDAO, 'create').mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '13800138000',
        creditPoints: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      } as any);

      // Mock hashPassword私有方法
      jest.spyOn(userService as any, 'hashPassword').mockResolvedValue('hashedPassword');

      const result = await userService.register(registerData);

      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(result.creditPoints).toBe(0);
      expect(userDAO.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '13800138000',
        creditPoints: 0
      });
    });

    it('应该抛出用户名已存在的错误', async () => {
      const registerData: RegisterUserDTO = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123',
        phone: '13800138000'
      };

      jest.spyOn(userDAO, 'existsByUsername').mockResolvedValue(true);

      await expect(userService.register(registerData)).rejects.toThrow('用户名已存在');
    });

    it('应该抛出邮箱已存在的错误', async () => {
      const registerData: RegisterUserDTO = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123',
        phone: '13800138000'
      };

      jest.spyOn(userDAO, 'existsByUsername').mockResolvedValue(false);
      jest.spyOn(userDAO, 'existsByEmail').mockResolvedValue(true);

      await expect(userService.register(registerData)).rejects.toThrow('邮箱已存在');
    });
  });

  describe('login', () => {
    it('应该成功登录用户', async () => {
      const loginData: LoginUserDTO = {
        usernameOrEmail: 'testuser',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '13800138000',
        creditPoints: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      jest.spyOn(userDAO, 'findByUsername').mockResolvedValue(mockUser as any);
      jest.spyOn(userDAO, 'findByEmail').mockResolvedValue(null);

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.login(loginData);

      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('应该通过邮箱登录成功', async () => {
      const loginData: LoginUserDTO = {
        usernameOrEmail: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        phone: '13800138000',
        creditPoints: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      jest.spyOn(userDAO, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userDAO, 'findByEmail').mockResolvedValue(mockUser as any);

      // Mock bcrypt.compare
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.login(loginData);

      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('应该抛出用户不存在的错误', async () => {
      const loginData: LoginUserDTO = {
        usernameOrEmail: 'nonexistent',
        password: 'password123'
      };

      jest.spyOn(userDAO, 'findByUsername').mockResolvedValue(null);
      jest.spyOn(userDAO, 'findByEmail').mockResolvedValue(null);

      await expect(userService.login(loginData)).rejects.toThrow('用户不存在');
    });

    it('应该抛出密码错误的错误', async () => {
      const loginData: LoginUserDTO = {
        usernameOrEmail: 'testuser',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedCorrectPassword',
        phone: '13800138000',
        creditPoints: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      };

      jest.spyOn(userDAO, 'findByUsername').mockResolvedValue(mockUser as any);
      jest.spyOn(userDAO, 'findByEmail').mockResolvedValue(null);

      // Mock bcrypt.compare返回false
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.login(loginData)).rejects.toThrow('密码错误');
    });
  });

  describe('getUserById', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Test User',
        phone: '13800138000',
        avatar: 'avatar.jpg',
        creditPoints: 100,
        role: 'user',
        createdAt: new Date('2024-01-01')
      };

      jest.spyOn(userDAO, 'findById').mockResolvedValue(mockUser as any);

      const result = await userService.getUserById(1);

      expect(result).not.toBeNull();
      expect(result!.username).toBe('testuser');
      expect(result!.email).toBe('test@example.com');
    });

    it('应该返回null当用户不存在时', async () => {
      jest.spyOn(userDAO, 'findById').mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('应该成功更新用户信息', async () => {
      const updateData = {
        realName: 'Updated Name',
        phone: '13900139000',
        avatar: 'new-avatar.jpg'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        realName: 'Updated Name',
        phone: '13900139000',
        avatar: 'new-avatar.jpg',
        creditPoints: 100,
        role: 'user',
        createdAt: new Date('2024-01-01')
      };

      jest.spyOn(userDAO, 'update').mockResolvedValue(mockUser as any);

      const result = await userService.updateUser(1, updateData);

      expect(result).not.toBeNull();
      expect(result!.realName).toBe('Updated Name');
      expect(result!.phone).toBe('13900139000');
    });

    it('应该返回null当用户不存在时', async () => {
      jest.spyOn(userDAO, 'update').mockResolvedValue(null);

      const result = await userService.updateUser(999, { realName: 'Test' });

      expect(result).toBeNull();
    });
  });
});