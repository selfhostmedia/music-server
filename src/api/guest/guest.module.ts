import { GuestCreateSessionModule } from './create-session/create-session.module';
import { GuestHealthcheckController } from './healthcheck/healthcheck.controller';
import { GuestHealthcheckModule } from './healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GuestCreateSessionModule, GuestHealthcheckModule],
  controllers: [GuestHealthcheckController],
})
export class GuestModule {}
