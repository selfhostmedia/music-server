import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { entitiesList } from './entities';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          autoLoadModels: false,
          debug: false,
          dialect: 'sqlite',
          logging: false,
          models: entitiesList,
          pool: { max: 1, idle: Infinity, maxUses: Infinity },
          storage: configService.get('DATABASE_PATH'),
          synchronize: false,
        };
      },
    }),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
