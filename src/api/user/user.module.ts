import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { SynologyModule } from '../synology-audiostation/synology.module';
import { UserEndSessionModule } from './end-session/end-session.module';

@Module({
  imports: [
    UserEndSessionModule,
    // Synology AudioStation API endpoints for use with DS Audio apps
    // iOS: https://apps.apple.com/us/app/ds-audio/id321495303
    // Android: https://play.google.com/store/apps/details?id=com.synology.DSaudio&hl=en-US
    // Android: https://www.synology.com/en-us/support/download
    ...(process.env.SYNOLOGY_AUDIOSTATION_ENABLED ? [SynologyModule] : []),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class UserModule {}
