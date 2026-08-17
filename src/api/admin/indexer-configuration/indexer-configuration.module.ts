import { AdminIndexerConfigurationController } from './indexer-configuration.controller';
import { AdminIndexerConfigurationService } from './indexer-configuration.service';
import { IndexerConfigurationEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([IndexerConfigurationEntity])],
  providers: [AdminIndexerConfigurationService],
  controllers: [AdminIndexerConfigurationController],
})
export class AdminIndexerConfigurationModule {}
