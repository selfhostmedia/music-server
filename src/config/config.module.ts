import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { DynamicModule, Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      imports: [BaseConfigModule.forRoot({ isGlobal: true })],
      module: ConfigModule,
      providers: [ConfigService],
      exports: [ConfigService],
    };
  }
}
