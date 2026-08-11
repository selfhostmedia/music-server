import { AccountEntity, SessionEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserEndSessionController } from './end-session.controller';
import { UserEndSessionService } from './end-session.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, SessionEntity])],
  controllers: [UserEndSessionController],
  providers: [UserEndSessionService],
})
export class UserEndSessionModule {}
