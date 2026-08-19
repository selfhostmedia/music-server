import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { AdminListIndexerLogsController } from './list-indexer-logs.controller';
import { AdminListIndexerLogsService } from './list-indexer-logs.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, RootPathEntity])],
  controllers: [AdminListIndexerLogsController],
  providers: [AdminListIndexerLogsService],
})
export class AdminListIndexerLogsModule {}
