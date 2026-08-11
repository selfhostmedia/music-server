import {
  CollatedArtistEntity,
  CollatedGenreAlbumEntity,
  GenreEntity,
} from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SynologyArtistDataDto, SynologyArtistDto } from './dtos';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';

function personToRow(person: CollatedArtistEntity): SynologyArtistDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `artist_${person.id}`,
    name: replaceDoubleQuotes(person.name),
  };
}

function albumToRow(album: CollatedGenreAlbumEntity) {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `album_${album.id}`,
    name: replaceDoubleQuotes(album.artist),
  };
}

@Injectable()
export class SynologyArtistService {
  constructor(
    @InjectModel(CollatedArtistEntity)
    private readonly collatedArtistEntity: typeof CollatedArtistEntity,
    @InjectModel(CollatedGenreAlbumEntity)
    private readonly collatedGenreAlbumEntity: typeof CollatedGenreAlbumEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  async listArtists(
    accountId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyArtistDataDto> {
    const artists = await this.collatedArtistEntity.findAll({
      where: {
        accountId,
      },
      offset,
      limit: limit || 1000,
      order: [['name', 'ASC']],
    });
    const total = await this.collatedArtistEntity.count({
      where: {
        accountId,
      },
    });
    return {
      artists: artists.map(personToRow),
      offset,
      total,
    };
  }

  async listArtistsByGenre(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyArtistDataDto> {
    const genres = await this.genreEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
        nameNormalized: {
          [Op.in]: genreName.split('/').map(normalizeString),
        },
      },
    });
    if (!genres?.length) {
      throw new NotFoundException(`Genre not found: ${genreName}`);
    }
    const artists = await this.collatedGenreAlbumEntity.findAll({
      where: {
        accountId,
        genreId: {
          [Op.in]: genres.map((genre) => genre.id),
        },
      },
      group: ['CollatedGenreAlbumEntity.artist'],
      order: [['title', 'ASC']],
      offset,
      limit: limit || 100000,
    });
    const total = await this.collatedGenreAlbumEntity.count({
      attributes: [
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('title')),
          ),
          'count',
        ],
      ],
      where: {
        accountId,
        genreId: {
          [Op.in]: genres.map((genre) => genre.id),
        },
      },
    });
    return {
      artists: artists.map(albumToRow),
      offset,
      total,
    };
  }
}
