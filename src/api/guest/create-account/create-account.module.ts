import { AccountEntity } from 'src/database/entities';
import { GuestCreateAccountController } from './create-account.controller';
import { GuestCreateAccountService } from './create-account.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [GuestCreateAccountController],
  providers: [GuestCreateAccountService],
})
export class GuestCreateAccountModule {}
