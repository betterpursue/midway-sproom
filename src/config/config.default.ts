import { MidwayConfig } from '@midwayjs/core';
import { join } from 'path';
import { User } from '../filter/entity/user.entity';
import { Activity } from '../filter/entity/activity.entity';
import { ActivityRegistration } from '../filter/entity/activity-registration.entity';
import { ActivityComment } from '../filter/entity/activity-comment.entity';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1754275622272_5195',
  koa: {
    port: 7001,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '1754275622272_5195',
    expiresIn: '24h',
    issuer: 'sports-room-api',
  },
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: join(__dirname, '../../sports-room.db'),
        synchronize: true,
        logging: false,
        entities: [User, Activity, ActivityRegistration, ActivityComment],
      },
    },
  },
} as MidwayConfig;