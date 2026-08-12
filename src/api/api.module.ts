import { APP_GUARD } from '@nestjs/core';
import { GuestModule } from './guest/guest.module';
import { Module } from '@nestjs/common';
import { RoleGuard } from './role.guard';
import { SynologyModule } from './synology-audiostation/synology.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    GuestModule,
    UserModule,
    ...(process.env.SYNOLOGY_AUDIOSTATION_ENABLED ? [SynologyModule] : []),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class ApiModule {}
