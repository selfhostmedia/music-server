import { AdminSetIndexerStatusController } from './set-indexer-status.controller';
import { AdminSetIndexerStatusService } from './set-indexer-status.service';
import { IndexerConfigurationEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([IndexerConfigurationEntity])],
  controllers: [AdminSetIndexerStatusController],
  providers: [AdminSetIndexerStatusService],
})
export class AdminSetIndexerStatusModule {}
