import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserListRootPathsController } from './list-root-paths.controller';
import { UserListRootPathsService } from './list-root-paths.service';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [UserListRootPathsController],
  providers: [UserListRootPathsService],
})
export class UserListRootPathsModule {}
