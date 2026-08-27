import {
  AlbumEntity,
  ArtistEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { AlbumFilters } from './types/album-filter';
import { FindOptions, Includeable, Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { normalizeString } from 'src/utils/strings';
import { AlbumSortFieldEnum } from 'src/types/enums';

@Injectable()
export class LibraryAlbumService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering albums based on the provided parameters.
   * @param {number} accountId The account ID to retrieve albums for.
   * @param {AlbumFilters} filters The filters to apply when querying for albums.
   * @returns {Promise<FindOptions<FileEntity>>} A Sequelize where clause object for filtering albums.
   */
  async createAlbumQueryFilter(accountId: number, filters?: AlbumFilters): Promise<FindOptions<FileEntity>> {
    const artistIds: number[] = [];
    const composerIds: number[] = [];
    const genreIds: number[] = [];
    // artists does a partial-match because the data may be expressed inconsistently like:
    // - Artist 1              -> [Artist 1]
    // - Artist 1, Artist 2    -> [Artist 1, Artist 2]
    // - Artist 1 & Artist 2   -> [Artist 1 & Artist 2]
    // - Artist 1 ft. Artist 2 -> [Artist 1 ft. Artist 2]
    // - Artist 1 + Artist 2   -> [Artist 1 + Artist 2]
    // - Artist 1 and Artist 2 -> [Artist 1 + Artist 2]
    // and of course punctuation like & or + can be part of a singular name, eg:
    // - Florence + The Machine
    // - Nick Cave & The Bad Seeds
    if (filters?.artist || filters?.filter) {
      const artistFilter = filters.artist
        ? {
            nameNormalized: {
              [Op.or]: filters.artist.map((artist) => ({
                [Op.like]: `%${normalizeString(artist)}%`,
              })),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const artists = await this.artistEntity.findAll({
        attributes: ['id', 'name'],
        where: {
          [Op.or]: [artistFilter, searchFilter],
        },
        raw: true,
      });
      artistIds.push(...artists.map((artist) => artist.id));
    }
    // composers does a partial-match because the data may be expressed inconsistently like:
    // - Composer 1                -> [Composer 1]
    // - Composer 1, Composer 2    -> [Composer 1, Composer 2]
    // - Composer 1 & Composer 2   -> [Composer 1 & Composer 2]
    // - Composer 1 ft. Composer 2 -> [Composer 1 ft. Composer 2]
    if (filters?.composer || filters?.filter) {
      const composerFilter = filters.composer
        ? {
            nameNormalized: {
              [Op.or]: filters.composer.map((composer) => ({
                [Op.like]: `%${normalizeString(composer)}%`,
              })),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const composers = await this.composerEntity.findAll({
        attributes: ['id'],
        where: {
          [Op.or]: [composerFilter, searchFilter],
        },
      });
      composerIds.push(...composers.map((composer) => composer.id));
    }
    // genres does an exact-match because there are many partial-matches like `Rock` vs `AlternRock`
    // that should not be co-mingled
    if (filters?.genre) {
      const genreFilter = filters.genre
        ? {
            nameNormalized: {
              [Op.or]: filters.genre.map(normalizeString),
            },
          }
        : {};
      const searchFilter = filters.filter
        ? {
            nameNormalized: {
              [Op.like]: normalizeString(filters.filter),
            },
          }
        : {};
      const genres = await this.genreEntity.findAll({
        attributes: ['id'],
        where: {
          accountId,
          [Op.or]: [genreFilter, searchFilter],
        },
      });
      genreIds.push(...genres.map((genre) => genre.id));
    }
    const joinedTables: Includeable[] = [];
    if (artistIds.length) {
      joinedTables.push({
        model: LinkedArtistEntity,
        attributes: [],
        where: {
          artistId: { [Op.in]: artistIds },
        },
      });
    }
    if (composerIds.length) {
      joinedTables.push({
        model: LinkedComposerEntity,
        attributes: [],
        where: {
          composerId: { [Op.in]: composerIds },
        },
      });
    }
    if (genreIds.length) {
      joinedTables.push({
        model: LinkedGenreEntity,
        attributes: [],
        where: {
          genreId: { [Op.in]: genreIds },
        },
      });
    }
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    if (normalizedFilterString) {
      joinedTables.push({
        model: AlbumEntity,
        attributes: [],
        where: {
          accountId,
          title: { [Op.like]: `%${normalizedFilterString}%` },
        },
      });
    }
    return {
      include: joinedTables,
      where: {
        accountId,
        ...(filters?.year && {
          year: filters.year,
        }),
        ...(filters?.minRating !== undefined && {
          rating: { [Op.gte]: filters.minRating },
        }),
        ...(filters?.maxRating !== undefined && {
          rating: {
            [Op.lte]: filters.maxRating,
          },
        }),
        ...(filters?.addedBefore && {
          createdAt: {
            [Op.lt]: filters.addedBefore,
          },
        }),
        ...(filters?.addedAfter && {
          createdAt: {
            [Op.gt]: filters.addedAfter,
          },
        }),
      },
    };
  }

  /**
   * Identifies the album IDs that are going to be returned in raw, unpaginated form based on the
   * query filtering parameters.
   * @param {FindOptions<FileEntity>} queryFilter The Sequelize find options for filtering albums
   * @returns {Promise<number[]>} The list of album IDs that match the query filter.
   */
  async findMatchingAlbumIds(queryFilter: FindOptions<FileEntity>): Promise<number[]> {
    const matchingAlbums = await this.fileEntity.findAll({
      ...queryFilter,
      attributes: [
        'albumId',
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      group: ['albumId'],
    });
    return matchingAlbums.map((album) => album.albumId);
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: AlbumSortFieldEnum): string {
    switch (sortField) {
      case AlbumSortFieldEnum.ALBUM:
        return 'title';
        break;
      case AlbumSortFieldEnum.YEAR:
        return 'year';
        break;
      case AlbumSortFieldEnum.RATING:
        return 'rating';
        break;
      case AlbumSortFieldEnum.DATE_ADDED:
        return 'createdAt';
        break;
      case AlbumSortFieldEnum.DATE_RELEASED:
        return 'year';
        break;
      case AlbumSortFieldEnum.ARTIST:
        return 'artists';
        break;
      case AlbumSortFieldEnum.ALBUM_ARTIST:
        return 'artists';
        break;
      case AlbumSortFieldEnum.COMPOSER:
        return 'composers';
        break;
      case AlbumSortFieldEnum.GENRE:
        return 'genres';
        break;
      default:
        return 'title';
    }
  }
}
