import { AdminDeleteRootPathController } from './delete-root-path.controller';
import { AdminDeleteRootPathService } from './delete-root-path.service';
import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [AdminDeleteRootPathController],
  providers: [AdminDeleteRootPathService],
})
export class AdminDeleteRootPathModule {}
