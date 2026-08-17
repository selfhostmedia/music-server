import { AccountEntity } from 'src/database/entities';
import { AdminDeleteAccountController } from './delete-account.controller';
import { AdminDeleteAccountService } from './delete-account.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminDeleteAccountController],
  providers: [AdminDeleteAccountService],
})
export class AdminDeleteAccountModule {}
