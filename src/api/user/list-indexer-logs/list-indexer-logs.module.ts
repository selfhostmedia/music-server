import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserListIndexerLogsController } from './list-indexer-logs.controller';
import { UserListIndexerLogsService } from './list-indexer-logs.service';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [UserListIndexerLogsController],
  providers: [UserListIndexerLogsService],
})
export class UserListIndexerLogsModule {}
