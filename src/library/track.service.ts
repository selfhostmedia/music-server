import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  CollatedTrackEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { TrackFilters } from './types/track-filter';
import { TrackSortFieldEnum } from 'src/types/enums';
import { normalizeString } from 'src/utils/strings';
import type { FindOptions, Includeable } from 'sequelize';

@Injectable()
export class LibraryTrackService {
  constructor(
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering album tracks based on the provided parameters.
   * @param {number} accountId The account ID to retrieve tracks for.
   * @param {TrackFilters} filters The filters to apply when querying for tracks.
   * @returns {Promise<FindOptions<ArtistEntity>>} A Sequelize where clause object for filtering tracks.
   */
  async createTrackQueryFilter(accountId: number, filters?: TrackFilters): Promise<FindOptions<FileEntity>> {
    const artistIds: number[] = [];
    const albumArtistIds: number[] = [];
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
    if (filters?.albumArtist || filters?.filter) {
      const artistFilter = filters.albumArtist
        ? {
            nameNormalized: {
              [Op.or]: filters.albumArtist.map((artist) => ({
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
      albumArtistIds.push(...artists.map((artist) => artist.id));
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
        required: true,
      });
    }

    if (composerIds.length) {
      joinedTables.push({
        model: LinkedComposerEntity,
        attributes: ['composerId'],
        where: {
          composerId: { [Op.in]: composerIds },
        },
        required: true,
      });
    }
    if (genreIds.length) {
      joinedTables.push({
        attributes: ['genreId'],
        model: LinkedGenreEntity,
        where: {
          genreId: { [Op.in]: genreIds },
        },
        required: true,
      });
    }
    if (filters?.album || albumArtistIds.length) {
      joinedTables.push({
        attributes: ['id'],
        model: AlbumEntity,
        where: {
          ...(filters?.album && {
            title: { [Op.like]: `%${normalizeString(filters.album)}%` },
          }),
        },
        include: albumArtistIds.length
          ? [
              {
                model: AlbumArtistEntity,
                attributes: ['artistId'],
                where: {
                  artistId: { [Op.in]: albumArtistIds },
                },
                required: true,
              },
            ]
          : [],
        required: true,
      });
    }
    const queryFilter = {
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
        ...(filters?.filter && {
          title: { [Op.like]: `%${normalizeString(filters.filter)}%` },
        }),
      },
    };
    return queryFilter;
  }

  // eslint-disable-next-line class-methods-use-this
  sortFieldToColumn(sortField?: TrackSortFieldEnum): string | undefined {
    switch (sortField) {
      case TrackSortFieldEnum.DATE_ADDED:
        return 'createdAt';
      case TrackSortFieldEnum.ARTIST:
        return 'trackArtists';
      case TrackSortFieldEnum.ALBUM:
        return 'albumTitle';
      case TrackSortFieldEnum.ALBUM_ARTIST:
        return 'albumArtists';
      case TrackSortFieldEnum.COMPOSER:
        return 'trackComposers';
      case TrackSortFieldEnum.GENRE:
        return 'trackGenres';
      case TrackSortFieldEnum.YEAR:
        return 'trackYear';
      case TrackSortFieldEnum.TITLE:
        return 'trackTitle';
      default:
        return undefined;
    }
  }
}
