import { AdminListRootPathsController } from './list-root-paths.controller';
import { AdminListRootPathsService } from './list-root-paths.service';
import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [AdminListRootPathsController],
  providers: [AdminListRootPathsService],
})
export class AdminListRootPathsModule {}
