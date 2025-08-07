# 体育活动室管理系统

基于Midway框架开发的体育活动室管理系统，提供完整的用户管理、活动管理、报名管理和评论功能。

## 功能特性

- ? 多用户注册、登录
- ? 活动管理（创建、更新、删除、查询）
- ? 活动报名管理
- ? 活动订单管理
- ? 活动列表查看和搜索
- ? 活动详情查看
- ? 活动评论和评分
- ? 基于RESTful API设计
- ? 使用SQLite3数据库存储
- ? 面向对象的代码设计

## 技术栈

- **后端框架**: Midway.js 3.x
- **数据库**: SQLite3 + TypeORM
- **API设计**: RESTful风格
- **验证**: @midwayjs/validate
- **密码加密**: SHA256
- **开发语言**: TypeScript

## 项目结构

```
src/
├── config/           # 配置文件
├── controller/       # 控制器层（API接口）
├── dao/             # 数据访问层
├── dto/             # 数据传输对象
├── entity/          # 数据库实体
├── filter/          # 异常过滤器
├── middleware/      # 中间件
├── script/          # 数据库初始化脚本
└── service/         # 业务逻辑层
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npx ts-node src/script/init-db.ts
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:7001 启动

## API文档

### 用户相关接口

#### 用户注册
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "realName": "测试用户",
  "phone": "13800138000"
}
```

#### 用户登录
```http
POST /api/users/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```

#### 获取用户信息
```http
GET /api/users/me?userId=1
```

### 活动相关接口

#### 创建活动
```http
POST /api/activities/
Content-Type: application/json

{
  "title": "周末篮球赛",
  "description": "欢迎篮球爱好者参加",
  "type": "basketball",
  "startTime": "2024-01-20T09:00:00Z",
  "endTime": "2024-01-20T12:00:00Z",
  "location": "市体育馆",
  "price": 20,
  "maxParticipants": 20
}
```

#### 获取活动列表
```http
GET /api/activities/?page=1&limit=10&type=basketball
```

#### 获取活动详情
```http
GET /api/activities/1
```

### 活动报名相关接口

#### 创建报名
```http
POST /api/registrations/
Content-Type: application/json

{
  "activityId": 1,
  "notes": "希望能和朋友一起参加"
}
```

#### 获取我的报名
```http
GET /api/registrations/my?userId=1&status=pending&page=1&limit=10
```

#### 取消报名
```http
DELETE /api/registrations/1?userId=1
```

## 测试账号

初始化数据库后，系统会自动创建以下测试账号：

- **管理员账号**: `admin` / `admin123`
- **测试账号**: `testuser` / `test123`

## 数据库结构

### 用户表 (users)
- id (主键)
- username (用户名)
- email (邮箱)
- password (密码)
- phone (手机号)
- realName (真实姓名)
- avatar (头像)
- creditPoints (积分)
- createdAt (创建时间)
- updatedAt (更新时间)

### 活动表 (activities)
- id (主键)
- title (标题)
- description (描述)
- type (类型)
- startTime (开始时间)
- endTime (结束时间)
- location (地点)
- price (价格)
- currentParticipants (当前人数)
- maxParticipants (最大人数)
- status (状态)
- imageUrl (图片URL)
- createdAt (创建时间)
- updatedAt (更新时间)

### 报名表 (activity_registrations)
- id (主键)
- user_id (用户ID)
- activity_id (活动ID)
- order_no (订单号)
- status (状态)
- amount (金额)
- notes (备注)
- createdAt (创建时间)
- updatedAt (更新时间)

### 评论表 (activity_comments)
- id (主键)
- user_id (用户ID)
- activity_id (活动ID)
- rating (评分)
- content (内容)
- createdAt (创建时间)
- updatedAt (更新时间)

## 开发规范

- 遵循RESTful API设计规范
- 使用TypeScript进行类型检查
- 采用分层架构设计
- 遵循单一职责原则
- 使用有意义的命名规范
- 代码注释完整规范

## 部署

### 生产环境部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

## 许可证

MIT License