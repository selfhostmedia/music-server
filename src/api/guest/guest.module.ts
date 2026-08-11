import { GuestCreateAccountModule } from './create-account/create-account.module';
import { GuestCreateSessionModule } from './create-session/create-session.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GuestCreateAccountModule, GuestCreateSessionModule],
})
export class GuestModule {}
