import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  ComposerEntity,
  FileEntity,
  FolderEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
  RootPathEntity,
} from 'src/database/entities';
import { IndexAlbumService } from './index-album.service';
import { IndexArtistService } from './index-artist.service';
import { IndexComposerService } from './index-composer.service';
import { IndexFileService } from './index-file.service';
import { IndexGenreService } from './index-genre.service';
import { IndexerService } from './indexer.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([
      AlbumEntity,
      AlbumArtistEntity,
      ArtistEntity,
      ComposerEntity,
      FileEntity,
      FolderEntity,
      GenreEntity,
      LinkedArtistEntity,
      LinkedComposerEntity,
      LinkedGenreEntity,
      RootPathEntity,
    ]),
  ],
  providers: [
    IndexerService,
    IndexAlbumService,
    IndexArtistService,
    IndexComposerService,
    IndexGenreService,
    IndexFileService,
  ],
  exports: [IndexerService],
})
export class IndexerModule {}
