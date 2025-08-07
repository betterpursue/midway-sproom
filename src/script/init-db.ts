import { DataSource } from 'typeorm';
import { join } from 'path';
import { User, UserRole } from '../filter/entity/user.entity';
import { Activity, ActivityType, ActivityStatus } from '../filter/entity/activity.entity';
import { ActivityRegistration } from '../filter/entity/activity-registration.entity';
import { ActivityComment } from '../filter/entity/activity-comment.entity';
import * as bcrypt from 'bcrypt';

/**
 * 初始化数据库
 * 创建测试数据并初始化数据库连接
 */
async function initDatabase() {
  let connection: DataSource | null = null;
  
  try {
    // 使用与 Midway 配置相同的数据库路径
    const AppDataSource = new DataSource({
      type: 'sqlite',
      database: join(__dirname, '../../sports-room.db'),
      synchronize: true,
      logging: false,
      entities: [
        User,
        Activity,
        ActivityRegistration,
        ActivityComment
      ],
    });

    connection = await AppDataSource.initialize();
    console.log('数据库连接成功');

    // 获取仓库
    const userRepository = connection.getRepository(User);
    const activityRepository = connection.getRepository(Activity);

    // 密码加密函数（使用 bcrypt）
    const hashPassword = async (password: string): Promise<string> => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };

    // 检查并创建管理员用户
    const existingAdmin = await userRepository.findOne({ 
      where: { email: 'admin@sports.com' } 
    });
    
    if (!existingAdmin) {
      await userRepository.save({
        username: 'admin',
        email: 'admin@sports.com',
        password: await hashPassword('admin123'),
        realName: '管理员',
        phone: '13800138000',
        creditPoints: 100,
        role: UserRole.ADMIN
      });
      console.log('管理员用户创建成功');
    } else {
      // 确保现有管理员用户的角色是admin
      if (existingAdmin.role !== UserRole.ADMIN) {
        await userRepository.update(existingAdmin.id, { role: UserRole.ADMIN });
        console.log('管理员用户角色已更新');
      } else {
        console.log('管理员用户已存在，跳过创建');
      }
    }

    // 检查并创建测试用户
    const existingTestUser = await userRepository.findOne({ 
      where: { email: 'test@example.com' } 
    });
    
    if (!existingTestUser) {
      await userRepository.save({
        username: 'testuser',
        email: 'test@example.com',
        password: await hashPassword('test123'),
        realName: '测试用户',
        phone: '13900139000',
        creditPoints: 50,
        role: UserRole.USER
      });
      console.log('测试用户创建成功');
    } else {
      console.log('测试用户已存在，跳过创建');
    }

    // 检查并创建测试活动
    const existingActivities = await activityRepository.count();
    
    if (existingActivities === 0) {
      await activityRepository.save([
        {
          title: '周末篮球友谊赛',
          description: '欢迎篮球爱好者参加周末篮球友谊赛，一起享受运动的快乐！',
          type: ActivityType.BASKETBALL,
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 2天后 + 3小时
          location: '市中心体育馆',
          price: 20,
          maxParticipants: 20,
          currentParticipants: 0,
          status: ActivityStatus.OPEN,
          imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'
        },
        {
          title: '瑜伽入门课程',
          description: '专业瑜伽教练指导，适合初学者的瑜伽入门课程，放松身心。',
          type: ActivityType.YOGA,
          startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1天后
          endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 1天后 + 2小时
          location: '社区健身中心瑜伽室',
          price: 30,
          maxParticipants: 15,
          currentParticipants: 0,
          status: ActivityStatus.OPEN,
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'
        },
        {
          title: '五人制足球赛',
          description: '每周一次的五人制足球赛，欢迎足球爱好者组队参加！',
          type: ActivityType.FOOTBALL,
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 3天后 + 2小时
          location: '城市足球场',
          price: 25,
          maxParticipants: 10,
          currentParticipants: 0,
          status: ActivityStatus.OPEN,
          imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
        }
      ]);
      console.log('测试活动创建成功');
    } else {
      console.log('活动数据已存在，跳过创建');
    }

    console.log('测试数据初始化完成');
    console.log('管理员账号: admin / admin123');
    console.log('测试账号: testuser / test123');

  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  } finally {
    // 确保连接被正确关闭
    if (connection) {
      await connection.destroy();
      console.log('数据库连接已关闭');
    }
  }
}

// 执行初始化
initDatabase().catch(console.error);