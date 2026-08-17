import { AccountEntity } from 'src/database/entities/account.entity';
import { AdminCreateRootPathController } from './create-root-path.controller';
import { AdminCreateRootPathService } from './create-root-path.service';
import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities/root-path.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, RootPathEntity])],
  controllers: [AdminCreateRootPathController],
  providers: [AdminCreateRootPathService],
})
export class AdminCreateRootPathModule {}
