import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserCreateRootPathModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserListIndexerLogsModule,
    UserListRootPathsModule,
    UserUpdatePasswordModule,
    UserRegenerateSessionKeyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class UserModule {}
