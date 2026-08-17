import { AccountEntity } from 'src/database/entities';
import { AdminCreateAccountController } from './create-account.controller';
import { AdminCreateAccountService } from './create-account.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminCreateAccountController],
  providers: [AdminCreateAccountService],
})
export class AdminCreateAccountModule {}
