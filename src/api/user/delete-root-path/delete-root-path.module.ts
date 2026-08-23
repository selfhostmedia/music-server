import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserDeleteRootPathController } from './delete-root-path.controller';
import { UserDeleteRootPathService } from './delete-root-path.service';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [UserDeleteRootPathController],
  providers: [UserDeleteRootPathService],
})
export class UserDeleteRootPathModule {}
