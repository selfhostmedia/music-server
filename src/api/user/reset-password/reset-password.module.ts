import { AccountEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserResetPasswordController } from './reset-password.controller';
import { UserResetPasswordService } from './reset-password.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [UserResetPasswordController],
  providers: [UserResetPasswordService],
})
export class UserResetPasswordModule {}
