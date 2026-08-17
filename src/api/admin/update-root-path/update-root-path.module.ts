import { AdminUpdateRootPathController } from './update-root-path.controller';
import { AdminUpdateRootPathService } from './update-root-path.service';
import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([RootPathEntity])],
  controllers: [AdminUpdateRootPathController],
  providers: [AdminUpdateRootPathService],
})
export class AdminUpdateRootPathModule {}
