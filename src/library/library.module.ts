import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  CollatedAlbumEntity,
  CollatedArtistEntity,
  CollatedTrackEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
} from '../database/entities';
import { LibraryAlbumService } from './album.service';
import { LibraryArtistService } from './artist.service';
import { LibraryComposerService } from './composer.service';
import { LibraryService } from './library.service';
import { LibraryTrackService } from './track.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AlbumEntity,
      AlbumArtistEntity,
      ArtistEntity,
      CollatedAlbumEntity,
      CollatedArtistEntity,
      CollatedTrackEntity,
      ComposerEntity,
      FileEntity,
      GenreEntity,
    ]),
  ],
  providers: [LibraryService, LibraryAlbumService, LibraryArtistService, LibraryComposerService, LibraryTrackService],
  exports: [LibraryService],
})
export class LibraryModule {}
