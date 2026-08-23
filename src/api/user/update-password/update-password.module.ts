import { AccountEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserUpdatePasswordController } from './update-password.controller';
import { UserUpdatePasswordService } from './update-password.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [UserUpdatePasswordController],
  providers: [UserUpdatePasswordService],
})
export class UserUpdatePasswordModule {}
