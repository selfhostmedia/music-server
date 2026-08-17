import { ConfigService as BaseConfigService } from '@nestjs/config';
import { Environment } from './environment';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService extends BaseConfigService<Environment, true> {
  /**
   * Flag for disabling the indexing service from scanning folders
   */
  public disableIndexing: boolean = false;

  get<T extends keyof Environment>(key: T): Environment[T] {
    return super.get(key);
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }
}
