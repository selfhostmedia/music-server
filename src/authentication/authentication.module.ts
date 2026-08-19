import { AUTHENTICATION_PROVIDER } from 'src/constants/providers';
import { AccountEntity, SessionEntity } from 'src/database/entities';
import { AuthenticationService } from './authentication.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, SessionEntity, SystemConfigurationEntity])],
  providers: [
    AuthenticationService,
    {
      provide: AUTHENTICATION_PROVIDER,
      useClass: AuthenticationService,
    },
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
