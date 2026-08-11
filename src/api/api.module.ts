import { GuestModule } from './guest/guest.module';
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Module({
  imports: [GuestModule, UserModule],
})
export class ApiModule {}
