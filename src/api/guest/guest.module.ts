import { GuestHealthcheckController } from './healthcheck/healthcheck.controller';
import { GuestHealthcheckModule } from './healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GuestHealthcheckModule],
  controllers: [GuestHealthcheckController],
})
export class GuestModule {}
