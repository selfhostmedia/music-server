import { AccountEntity } from 'src/database/entities';
import { AdminUpdateUserRolesController } from './update-user-roles.controller';
import { AdminUpdateUserRolesService } from './update-user-roles.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminUpdateUserRolesController],
  providers: [AdminUpdateUserRolesService],
})
export class AdminUpdateUserRolesModule {}
