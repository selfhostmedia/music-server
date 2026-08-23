import { AccountEntity } from 'src/database/entities/account.entity';
import { Module } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities/root-path.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserCreateRootPathController } from './create-root-path.controller';
import { UserCreateRootPathService } from './create-root-path.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, RootPathEntity])],
  controllers: [UserCreateRootPathController],
  providers: [UserCreateRootPathService],
})
export class UserCreateRootPathModule {}
