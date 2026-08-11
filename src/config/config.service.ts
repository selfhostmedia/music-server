import * as dotenv from 'dotenv';
import { ConfigService as BaseConfigService } from '@nestjs/config';
import { Environment } from './environment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService extends BaseConfigService<Environment, true> {
  constructor() {
    super();
    if (process.env.NODE_ENV === 'development') {
      dotenv.config();
    }
  }

  get<T extends keyof Environment>(key: T): Environment[T] {
    return super.get(key);
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'development';
  }
}
