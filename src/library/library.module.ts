import {
  AlbumEntity,
  ArtistEntity,
  CollatedAlbumEntity,
  CollatedTrackEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
} from '../database/entities';
import { LibraryService } from './library.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AlbumEntity,
      ArtistEntity,
      CollatedAlbumEntity,
      CollatedTrackEntity,
      ComposerEntity,
      FileEntity,
      GenreEntity,
    ]),
  ],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
