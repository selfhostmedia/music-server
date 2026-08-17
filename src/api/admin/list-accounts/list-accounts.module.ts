import { AccountEntity } from 'src/database/entities';
import { AdminListAccountsController } from './list-accounts.controller';
import { AdminListAccountsService } from './list-accounts.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminListAccountsController],
  providers: [AdminListAccountsService],
})
export class AdminListAccountsModule {}
