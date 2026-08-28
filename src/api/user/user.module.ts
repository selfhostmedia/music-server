import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { RoleGuard } from '../role.guard';
import { UserAlbumCoverModule } from './album-cover/album-cover.module';
import { UserArtistCoverModule } from './artist-cover/artist-cover.module';
import { UserCreateRootPathModule } from './create-root-path/create-root-path.module';
import { UserDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { UserEndSessionModule } from './end-session/end-session.module';
import { UserListAlbumArtistsModule } from './list-album-artists/list-album-artists.module';
// eslint-disable-next-line max-len
import { UserListAlbumArtistsWithTracksModule } from './list-album-artists-with-tracks/list-album-artists-with-tracks.module';
import { UserListAlbumsModule } from './list-albums/list-albums.module';
import { UserListAlbumsWithTracksModule } from './list-albums-with-tracks/list-albums-with-tracks.module';
import { UserListComposersModule } from './list-composers/list-composers.module';
import { UserListComposersWithTracksModule } from './list-composers-with-tracks/list-composers-with-tracks.module';
import { UserListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { UserListRootPathsModule } from './list-root-paths/list-root-paths.module';
import { UserRegenerateSessionKeyModule } from './regenerate-session-key/regenerate-session-key.module';
import { UserRetrieveAlbumModule } from './retrieve-album/retrieve-album.module';
import { UserUpdatePasswordModule } from './update-password/update-password.module';

@Module({
  imports: [
    UserAlbumCoverModule,
    UserArtistCoverModule,
    UserCreateRootPathModule,
    UserDeleteRootPathModule,
    UserEndSessionModule,
    UserListAlbumsModule,
    UserListAlbumsWithTracksModule,
    UserListAlbumArtistsModule,
    UserListAlbumArtistsWithTracksModule,
    UserListComposersModule,
    UserListComposersWithTracksModule,
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
