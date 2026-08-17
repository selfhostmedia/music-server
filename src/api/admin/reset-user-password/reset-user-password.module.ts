import { AccountEntity } from 'src/database/entities';
import { AdminResetUserPasswordController } from './reset-user-password.controller';
import { AdminResetUserPasswordService } from './reset-user-password.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminResetUserPasswordController],
  providers: [AdminResetUserPasswordService],
})
export class AdminResetUserPasswordModule {}
