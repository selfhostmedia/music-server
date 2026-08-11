import {
  ArtistEntity,
  CollatedArtistAlbumEntity,
  CollatedComposerAlbumEntity,
  CollatedGenreAlbumEntity,
  CollatedTrackEntity,
  GenreEntity,
} from 'src/database/entities';
import { CollatedAlbumEntity } from 'src/database/entities/collated-album.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SynologyAlbumDataDto, SynologyAlbumDto } from './dtos';
import {
  normalizeString,
  replaceDoubleQuotes,
  sanitizeString,
} from 'src/utils/strings';

function albumToRow(
  album:
    | CollatedAlbumEntity
    | CollatedComposerAlbumEntity
    | CollatedArtistAlbumEntity
    | CollatedGenreAlbumEntity,
): SynologyAlbumDto {
  return {
    additional: {
      avg_rating: {
        rating: 0,
      },
    },
    album_artist: replaceDoubleQuotes(album.artists.join(', ')),
    artist: '',
    display_artist: album.artists.join(', '),
    name: replaceDoubleQuotes(album.title),
    year: album.year,
  };
}

@Injectable()
export class SynologyAlbumService {
  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(CollatedAlbumEntity)
    private readonly collatedAlbumEntity: typeof CollatedAlbumEntity,
    @InjectModel(CollatedArtistAlbumEntity)
    private readonly collatedArtistAlbumEntity: typeof CollatedArtistAlbumEntity,
    @InjectModel(CollatedComposerAlbumEntity)
    private readonly collatedComposerAlbumEntity: typeof CollatedComposerAlbumEntity,
    @InjectModel(CollatedGenreAlbumEntity)
    private readonly collatedGenreAlbumEntity: typeof CollatedGenreAlbumEntity,
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  async getGenreByName(name: string): Promise<GenreEntity | null> {
    return this.genreEntity.findOne({
      where: {
        nameNormalized: normalizeString(name),
      },
    });
  }

  async listAlbums(accountId: number, offset: number, limit: number) {
    const albums = await this.collatedAlbumEntity.findAll({
      where: {
        accountId,
      },
      offset,
      limit: limit || 100000,
      order: [['title', 'ASC']],
    });
    const total = await this.collatedAlbumEntity.count({
      where: {
        accountId,
      },
    });
    return {
      albums: albums.map(albumToRow),
      offset,
      total,
    };
  }

  async listArtistAlbums(
    accountId: number,
    artistName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const artist = await this.artistEntity.findOne({
      where: {
        nameNormalized: normalizeString(artistName),
      },
    });
    if (!artist) {
      throw new NotFoundException(`Artist not found for name: ${artistName}`);
    }
    const albums = await this.collatedArtistAlbumEntity.findAll({
      where: {
        accountId,
        artistId: artist.id,
      },
      offset,
      limit,
      order: [['title', 'ASC']],
    });
    const total = await this.collatedArtistAlbumEntity.count({
      where: {
        accountId,
        artistId: artist.id,
      },
    });
    return {
      albums: albums.map(albumToRow),
      offset,
      total,
    };
  }

  async listArtistGenreAlbums(
    accountId: number,
    artistName: string,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
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
    const albums = await this.collatedGenreAlbumEntity.findAll({
      where: {
        accountId,
        artist: sanitizeString(artistName),
        genreId: {
          [Op.in]: genres.map((genre) => genre.id),
        },
      },
      offset,
      limit,
      order: [['title', 'ASC']],
      group: ['title'],
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
        artist: sanitizeString(artistName),
        genreId: {
          [Op.in]: genres.map((genre) => genre.id),
        },
      },
    });
    return {
      albums: albums.map(albumToRow),
      offset,
      total,
    };
  }

  async listComposerAlbums(
    accountId: number,
    composerName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
    const albumData = await this.collatedTrackEntity.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('album_id')), 'albumId'],
      ],
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('track_composers')),
            composerName.toLocaleLowerCase(),
          ),
        ],
      },
    });
    const albumIds = albumData.map((data) => data.albumId);
    const albums = await this.collatedComposerAlbumEntity.findAll({
      where: {
        id: {
          [Op.in]: albumIds,
        },
      },
      order: [['title', 'ASC']],
      limit,
      offset,
    });
    const total = await this.collatedTrackEntity.count({
      attributes: [
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('album_id')),
          ),
          'count',
        ],
      ],
      where: {
        accountId,
        albumId: {
          [Op.in]: albumIds,
        },
      },
    });

    return {
      albums: albums.map(albumToRow),
      offset,
      total,
    };
  }

  async listGenreAlbums(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologyAlbumDataDto> {
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
    const albums = await this.collatedGenreAlbumEntity.findAll({
      where: {
        accountId,
        genreId: {
          [Op.in]: genres.map((genre) => genre.id),
        },
      },
      limit,
      offset,
      group: ['title'],
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
      albums: albums.map(albumToRow),
      offset,
      total,
    };
  }
}
