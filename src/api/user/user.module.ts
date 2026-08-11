import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { UserEndSessionModule } from './end-session/end-session.module';

@Module({
  imports: [UserEndSessionModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class UserModule {}
