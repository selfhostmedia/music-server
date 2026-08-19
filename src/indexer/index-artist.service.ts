/* eslint-disable no-await-in-loop */
import { ArtistEntity, FileEntity, LinkedArtistEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';

@Injectable()
export class IndexArtistService {
  private readonly logger: Logger = new Logger(IndexArtistService.name);

  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(LinkedArtistEntity)
    private readonly linkedArtistEntity: typeof LinkedArtistEntity,
  ) {}

  async insertOrRetrieveArtist(name: string, transaction?: Transaction): Promise<number> {
    const nameNormalized = normalizeString(name);
    const existing = await this.artistEntity.findOne({
      where: {
        nameNormalized,
      },
      transaction,
    });
    if (existing?.id) {
      return existing.id;
    }
    const artist = await this.artistEntity.create(
      {
        name: sanitizeString(name),
        nameNormalized,
      } as ArtistEntity,
      {
        transaction,
      },
    );
    return artist.id;
  }

  async updateArtists(embeddedData: IAudioMetadata, fileDetail: FileEntity, transaction?: Transaction) {
    const artists =
      embeddedData?.common.artists || splitArray(embeddedData?.common.artist ? [embeddedData?.common.artist] : []);
    for (let i = 0; i < artists.length; i += 1) {
      const name = artists[i]?.trim();
      if (name) {
        const artistId = await this.insertOrRetrieveArtist(name, transaction);
        const existingAssociation = await this.linkedArtistEntity.findOne({
          where: {
            artistId,
            fileId: fileDetail.id,
          },
          transaction,
        });
        if (!existingAssociation) {
          await this.linkedArtistEntity.create(
            {
              artistId,
              fileId: fileDetail.id,
            } as LinkedArtistEntity,
            {
              transaction,
            },
          );
        }
      }
    }
  }
}
