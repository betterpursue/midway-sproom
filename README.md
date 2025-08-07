# ������ҹ���ϵͳ

����Midway��ܿ�����������ҹ���ϵͳ���ṩ�������û����������������������۹��ܡ�

## ��������

- ? ���û�ע�ᡢ��¼
- ? ��������������¡�ɾ������ѯ��
- ? ���������
- ? ���������
- ? ��б�鿴������
- ? �����鿴
- ? ����ۺ�����
- ? ����RESTful API���
- ? ʹ��SQLite3���ݿ�洢
- ? �������Ĵ������

## ����ջ

- **��˿��**: Midway.js 3.x
- **���ݿ�**: SQLite3 + TypeORM
- **API���**: RESTful���
- **��֤**: @midwayjs/validate
- **�������**: SHA256
- **��������**: TypeScript

## ��Ŀ�ṹ

```
src/
������ config/           # �����ļ�
������ controller/       # �������㣨API�ӿڣ�
������ dao/             # ���ݷ��ʲ�
������ dto/             # ���ݴ������
������ entity/          # ���ݿ�ʵ��
������ filter/          # �쳣������
������ middleware/      # �м��
������ script/          # ���ݿ��ʼ���ű�
������ service/         # ҵ���߼���
```

## ���ٿ�ʼ

### 1. ��װ����

```bash
npm install
```

### 2. ��ʼ�����ݿ�

```bash
npx ts-node src/script/init-db.ts
```

### 3. ��������������

```bash
npm run dev
```

���������� http://localhost:7001 ����

## API�ĵ�

### �û���ؽӿ�

#### �û�ע��
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "realName": "�����û�",
  "phone": "13800138000"
}
```

#### �û���¼
```http
POST /api/users/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```

#### ��ȡ�û���Ϣ
```http
GET /api/users/me?userId=1
```

### ���ؽӿ�

#### �����
```http
POST /api/activities/
Content-Type: application/json

{
  "title": "��ĩ������",
  "description": "��ӭ���򰮺��߲μ�",
  "type": "basketball",
  "startTime": "2024-01-20T09:00:00Z",
  "endTime": "2024-01-20T12:00:00Z",
  "location": "��������",
  "price": 20,
  "maxParticipants": 20
}
```

#### ��ȡ��б�
```http
GET /api/activities/?page=1&limit=10&type=basketball
```

#### ��ȡ�����
```http
GET /api/activities/1
```

### �������ؽӿ�

#### ��������
```http
POST /api/registrations/
Content-Type: application/json

{
  "activityId": 1,
  "notes": "ϣ���ܺ�����һ��μ�"
}
```

#### ��ȡ�ҵı���
```http
GET /api/registrations/my?userId=1&status=pending&page=1&limit=10
```

#### ȡ������
```http
DELETE /api/registrations/1?userId=1
```

## �����˺�

��ʼ�����ݿ��ϵͳ���Զ��������²����˺ţ�

- **����Ա�˺�**: `admin` / `admin123`
- **�����˺�**: `testuser` / `test123`

## ���ݿ�ṹ

### �û��� (users)
- id (����)
- username (�û���)
- email (����)
- password (����)
- phone (�ֻ���)
- realName (��ʵ����)
- avatar (ͷ��)
- creditPoints (����)
- createdAt (����ʱ��)
- updatedAt (����ʱ��)

### ��� (activities)
- id (����)
- title (����)
- description (����)
- type (����)
- startTime (��ʼʱ��)
- endTime (����ʱ��)
- location (�ص�)
- price (�۸�)
- currentParticipants (��ǰ����)
- maxParticipants (�������)
- status (״̬)
- imageUrl (ͼƬURL)
- createdAt (����ʱ��)
- updatedAt (����ʱ��)

### ������ (activity_registrations)
- id (����)
- user_id (�û�ID)
- activity_id (�ID)
- order_no (������)
- status (״̬)
- amount (���)
- notes (��ע)
- createdAt (����ʱ��)
- updatedAt (����ʱ��)

### ���۱� (activity_comments)
- id (����)
- user_id (�û�ID)
- activity_id (�ID)
- rating (����)
- content (����)
- createdAt (����ʱ��)
- updatedAt (����ʱ��)

## �����淶

- ��ѭRESTful API��ƹ淶
- ʹ��TypeScript�������ͼ��
- ���÷ֲ�ܹ����
- ��ѭ��һְ��ԭ��
- ʹ��������������淶
- ����ע�������淶

## ����

### ������������

1. ������Ŀ
```bash
npm run build
```

2. ��������������
```bash
npm start
```

## ���֤

MIT License