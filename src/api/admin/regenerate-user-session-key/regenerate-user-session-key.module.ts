import { AccountEntity } from 'src/database/entities';
import { AdminRegenerateUserSessionKeyController } from './regenerate-user-session-key.controller';
import { AdminRegenerateUserSessionKeyService } from './regenerate-user-session-key.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [AdminRegenerateUserSessionKeyController],
  providers: [AdminRegenerateUserSessionKeyService],
})
export class AdminRegenerateUserSessionKeyModule {}
