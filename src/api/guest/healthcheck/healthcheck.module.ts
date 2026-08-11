import { GuestHealthcheckController } from './healthcheck.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [GuestHealthcheckController],
})
export class GuestHealthcheckModule {}
