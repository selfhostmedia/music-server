import { AccountEntity, SessionEntity } from 'src/database/entities';
import { GuestCreateSessionController } from './create-session.controller';
import { GuestCreateSessionService } from './create-session.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, SessionEntity])],
  controllers: [GuestCreateSessionController],
  providers: [GuestCreateSessionService],
  exports: [GuestCreateSessionService],
})
export class GuestCreateSessionModule {}
