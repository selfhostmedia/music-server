import { AccountEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { UserRegenerateSessionKeyController } from './regenerate-session-key.controller';
import { UserRegenerateSessionKeyService } from './regenerate-session-key.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [UserRegenerateSessionKeyController],
  providers: [UserRegenerateSessionKeyService],
})
export class UserRegenerateSessionKeyModule {}
