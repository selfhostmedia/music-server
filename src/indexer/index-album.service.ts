/* eslint-disable no-await-in-loop */
import { AlbumArtistEntity, AlbumEntity, RootPathEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { IndexArtistService } from './index-artist.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';

@Injectable()
export class IndexAlbumService {
  private readonly logger: Logger = new Logger(IndexAlbumService.name);

  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AlbumArtistEntity)
    private readonly albumArtistEntity: typeof AlbumArtistEntity,
    private readonly indexArtistService: IndexArtistService,
  ) {}

  async updateAlbum(
    rootPath: RootPathEntity,
    embeddedData: IAudioMetadata,
    folderPath: string,
    accountId?: number,
    transaction?: Transaction,
  ) {
    const existing = await this.albumEntity.findOne({
      where: {
        folderPath,
      },
      transaction,
    });
    if (existing) {
      return existing;
    }
    // insert the album
    const coverImage = embeddedData.common.picture?.[0]?.data ? Buffer.from(embeddedData.common.picture[0].data) : null;
    const coverImageMimeType = embeddedData.common.picture?.[0]?.format || null;
    const album = await this.albumEntity.create(
      {
        accountId,
        coverImage,
        coverImageMimeType,
        folderPath,
        rootPathId: rootPath.id,
        title: sanitizeString(embeddedData?.common.album || '') || '',
        titleNormalized: normalizeString(embeddedData?.common.album || '') || '',
        year: embeddedData?.common.year || 0,
      } as AlbumEntity,
      {
        transaction,
      },
    );
    // insert the album artists
    const albumArtists = embeddedData.common.albumartist
      ? [embeddedData.common.albumartist]
      : splitArray(embeddedData.common.albumartists || [embeddedData.common.artist || 'Unknown Artist']);
    for (let i = 0, len = albumArtists.length; i < len; i += 1) {
      const artist = albumArtists[i];
      if (artist) {
        const artistId = await this.indexArtistService.insertOrRetrieveArtist(artist, transaction);
        const existingAssociation = await this.albumArtistEntity.findOne({
          where: {
            albumId: album.id,
            artistId,
          },
          transaction,
        });
        if (!existingAssociation) {
          await this.albumArtistEntity.create(
            {
              albumId: album.id,
              artistId,
            } as AlbumArtistEntity,
            {
              transaction,
            },
          );
        }
      }
    }
    return album;
  }
}
