import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { UserAlbumCoverModule } from './album-cover/album-cover.module';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserListAlbumsModule } from './list-albums/list-albums.module';
import { UserListAlbumsWithTracksModule } from './list-albums-with-tracks/list-albums-with-tracks.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserRetrieveAlbumModule } from './retrieve-album/retrieve-album.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserAlbumCoverModule,
    UserCreateRootPathModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserListAlbumsModule,
    UserListAlbumsWithTracksModule,
    UserListIndexerLogsModule,
    UserListRootPathsModule,
    UserRetrieveAlbumModule,
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
