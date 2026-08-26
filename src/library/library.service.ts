import {
  AlbumEntity,
  ArtistEntity,
  CollatedAlbumEntity,
  CollatedTrackEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { AlbumSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { FindOptions, Includeable, Op, Sequelize } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './library.album.dto';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';

/**
 * The filters that can be applied when querying for albums in the library.
 */
type AlbumFilters = {
  /*
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedAfter?: Date;
  /**
   * Optional filter for the date the album was added to the library, which will do an exact match against
   * the date the album was added to the library.  The date must be in ISO 8601 format (YYYY-MM-DD).
   */
  addedBefore?: Date;
  /**
   * Optional filter for the artist(s), which will do a case-insensitive match against the
   * artists associated with an album.
   */
  artist?: string[];
  /**
   * Optional filter for the composer(s), which will do a case-insensitive match against the
   * composers associated with an album.
   */
  composer?: string[];
  /**
   * Optional filter for the genre(s), which will do a case-insensitive match against the
   * genres associated with an album.
   */
  genre?: string[];
  /**
   * Optional filter for the maximum rating value, which will do an exact match against the
   * aggregate rating of an album's tracks.
   */
  maxRating?: number;
  /**
   * Optional filter for the minimum rating value, which will do an exact match against the
   * aggregate rating of an album's tracks.
   */
  minRating?: number;
  /**
   * Optional filter for a case-insensitive partial-match against album, artist, composer, or genre.
   */
  filter?: string;
  /**
   * Optional filter for the release year, which will do an exact match against the
   */
  year?: number;
};

type ListResult<T> = {
  /**
   * The total number of items that match the query filter which may be greater than the items in the current page.
   */
  total: number;
  /**
   * The list of items returned for the current page, which may be empty if there are no matching items.
   */
  items: T[];
};

@Injectable()
export class LibraryService {
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
    @InjectModel(CollatedAlbumEntity)
    private readonly collatedAlbumEntity: typeof CollatedAlbumEntity,
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
  ) {}

  /**
   * Builds a Sequelize where clause for filtering albums based on the provided parameters.  It
   * is encapsulated into a function because it needs to be used for requesting paginated results
   * and again for counting total results, and because the filtering by names involves several
   * queries to identify the IDs of the artists, composers, and genres that match the provided filters.
   * @param {number} accountId The account ID to retrieve albums for.
   * @param {string[]} filter.artistFilter Optional case-insensitive partial-match filter for the artist(s)
   * @param {string[]} filter.composerFilter Optional case-insensitive partial-match filter for the composer(s)
   * @param {string[]} filter.genreFilter Optional case-insensitive partial-match filter for the genre(s)
   * @param {string} filter.searchFilter Optional case-insensitive partial-match filter for album, artist,
   * composer, or genre.
   * @param {number} filter.yearFilter Optional exact-match filter for the release year.
   * @param {number} filter.minRating Optional minimum rating value 0-5
   * @param {number} filter.maxRating Optional maximum rating value 0-5
   * @param {Date} filter.addedBefore Optional filter for the date the album was added to the library
   * @param {Date} filter.addedAfter Optional filter for the date the album was added to the library
   * @returns {Promise<FindOptions<FileEntity>>} A Sequelize where clause object for filtering albums.
   */
  private async albumQueryQueryFilter(accountId: number, filters?: AlbumFilters): Promise<FindOptions<FileEntity>> {
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
  private async findMatchingAlbumIds(queryFilter: FindOptions<FileEntity>): Promise<number[]> {
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

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {FindOptions<CollatedAlbumEntity>} queryFilter The Sequelize where clause for filtering albums
   * this should be constructed using the `albumQueryQueryFilter` method.
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortBy Optional field to sort the results by
   * @param {SortDirectionEnum} sortOrder Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumDto>>} The album list and total record count.
   */
  async listAlbums(
    accountId: number,
    filter: AlbumFilters,
    offset: number,
    limit: number,
    sortBy?: AlbumSortFieldEnum,
    sortOrder?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    let sortByColumn: string | undefined;
    switch (sortBy) {
      case AlbumSortFieldEnum.ALBUM:
        sortByColumn = 'title';
        break;
      case AlbumSortFieldEnum.YEAR:
        sortByColumn = 'year';
        break;
      case AlbumSortFieldEnum.RATING:
        sortByColumn = 'rating';
        break;
      case AlbumSortFieldEnum.DATE_ADDED:
        sortByColumn = 'createdAt';
        break;
      case AlbumSortFieldEnum.DATE_RELEASED:
        sortByColumn = 'year';
        break;
      case AlbumSortFieldEnum.ARTIST:
        sortByColumn = 'artists';
        break;
      case AlbumSortFieldEnum.ALBUM_ARTIST:
        sortByColumn = 'artists';
        break;
      case AlbumSortFieldEnum.COMPOSER:
        sortByColumn = 'composers';
        break;
      case AlbumSortFieldEnum.GENRE:
        sortByColumn = 'genres';
        break;
      default:
        sortByColumn = 'title';
    }
    const queryFilter = await this.albumQueryQueryFilter(accountId, filter);
    const matchingAlbums = await this.findMatchingAlbumIds(queryFilter);
    const albums = await this.collatedAlbumEntity.findAndCountAll({
      attributes: [
        'artists',
        'composers',
        'coverImageDarkMuted',
        'coverImageDarkVibrant',
        'coverImageLightMuted',
        'coverImageLightVibrant',
        'coverImageMuted',
        'coverImageVibrant',
        'createdAt',
        'genres',
        'id',
        'title',
        'year',
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      where: {
        id: matchingAlbums,
      },
      order: [[Sequelize.fn('lower', Sequelize.col(sortByColumn)), sortOrder || 'ASC']],
      offset,
      limit,
    });
    return {
      total: albums.count,
      items: albums.rows.map((album) => ({
        id: album.id,
        albumArtists: album.artists.map(replaceDoubleQuotes),
        albumComposers: album.composers.map(replaceDoubleQuotes),
        albumGenres: album.genres.map(replaceDoubleQuotes),
        coverImageDarkMuted: album.coverImageDarkMuted || '#000000',
        coverImageDarkVibrant: album.coverImageDarkVibrant || '#000000',
        coverImageLightMuted: album.coverImageLightMuted || '#FFFFFF',
        coverImageLightVibrant: album.coverImageLightVibrant || '#FFFFFF',
        coverImageMuted: album.coverImageMuted || '#000000',
        coverImageVibrant: album.coverImageVibrant || '#FFFFFF',
        createdAt: album.createdAt,
        displayArtist: album.artists.map(replaceDoubleQuotes),
        displayName: replaceDoubleQuotes(album.title),
        genres: album.genres.map(replaceDoubleQuotes),
        rating: (album as unknown as Record<string, number>).rating ?? 0,
        sortName: replaceDoubleQuotes(normalizeString(album.title)),
        year: album.year,
      })),
    };
  }

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters and bundling track lists for all albums.  If the track lists are not required
   * then the `listAlbums` method will provide better performance.
   * @param {FindOptions<CollatedAlbumEntity>} queryFilter The Sequelize where clause for filtering albums
   * this should be constructed using the `albumQueryQueryFilter` method.
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortBy Optional field to sort the results by
   * @param {SortDirectionEnum} sortOrder Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumWithTracksDto>>} The album list with tracks and total record count.
   */
  async listAlbumsWithTracks(
    accountId: number,
    filter: AlbumFilters,
    offset: number,
    limit: number,
    sortBy?: AlbumSortFieldEnum,
    sortOrder?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumWithTracksDto>> {
    const allAlbums = await this.listAlbums(accountId, filter, offset, limit, sortBy, sortOrder);
    const allTracks = await this.collatedTrackEntity.findAll({
      where: {
        albumId: allAlbums.items.map((album) => album.id),
      },
    });
    const tracksByAlbumId = allTracks.reduce(
      (acc, track) => {
        if (!acc[track.albumId]) {
          acc[track.albumId] = [];
        }
        acc[track.albumId]?.push(track);
        return acc;
      },
      {} as Record<number, typeof allTracks>,
    );
    return {
      total: allAlbums.total,
      items: allAlbums.items.map((partialAlbum) => {
        const album = partialAlbum as LibraryAlbumWithTracksDto;
        const tracks = tracksByAlbumId[album.id] || [];
        album.tracks = tracks.map((track) => ({
          artists: track.trackArtists.map(replaceDoubleQuotes),
          composers: track.trackComposers.map(replaceDoubleQuotes),
          discNumber: track.trackDiscNumber,
          duration: track.trackDuration,
          fileId: track.fileId,
          genres: track.trackGenres.map(replaceDoubleQuotes),
          id: track.fileId,
          rating: track.trackRating,
          title: replaceDoubleQuotes(track.trackTitle),
          trackNumber: track.trackNumber,
          year: track.trackYear,
        }));
        return album;
      }),
    };
  }

  async retrieveAlbum(accountId: number, albumId: number): Promise<LibraryAlbumWithTracksDto> {
    const album = await this.collatedAlbumEntity.findOne({
      attributes: [
        'artists',
        'composers',
        'coverImageDarkMuted',
        'coverImageDarkVibrant',
        'coverImageLightMuted',
        'coverImageLightVibrant',
        'coverImageMuted',
        'coverImageVibrant',
        'createdAt',
        'genres',
        'id',
        'title',
        'year',
        [
          this.albumEntity.sequelize!.literal(
            `(SELECT ROUND(SUM(rating) / COUNT(rating)) FROM files WHERE album_id = id)`,
          ),
          'rating',
        ],
      ],
      where: {
        id: albumId,
        accountId,
      },
    });
    if (!album) {
      throw new NotFoundException(ErrorCodes.ALBUM_NOT_FOUND_ERROR);
    }
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        albumId: album.id,
      },
    });
    return {
      id: album.id,
      albumArtists: album.artists.map(replaceDoubleQuotes),
      albumComposers: album.composers.map(replaceDoubleQuotes),
      albumGenres: album.genres.map(replaceDoubleQuotes),
      coverImageLightVibrant: album.coverImageLightVibrant || '#FFFFFF',
      coverImageDarkVibrant: album.coverImageDarkVibrant || '#000000',
      coverImageMuted: album.coverImageMuted || '#000000',
      coverImageVibrant: album.coverImageVibrant || '#FFFFFF',
      coverImageDarkMuted: album.coverImageDarkMuted || '#000000',
      coverImageLightMuted: album.coverImageLightMuted || '#FFFFFF',
      createdAt: album.createdAt,
      displayArtist: album.artists.map(replaceDoubleQuotes),
      displayName: replaceDoubleQuotes(album.title),
      rating: (album as unknown as Record<string, number>).rating ?? 0,
      sortName: replaceDoubleQuotes(normalizeString(album.title)),
      year: album.year,
      tracks: tracks.map((track) => ({
        artists: track.trackArtists.map(replaceDoubleQuotes),
        composers: track.trackComposers.map(replaceDoubleQuotes),
        discNumber: track.trackDiscNumber,
        duration: track.trackDuration,
        fileId: track.fileId,
        genres: track.trackGenres.map(replaceDoubleQuotes),
        id: track.id,
        rating: track.trackRating,
        title: replaceDoubleQuotes(track.trackTitle),
        trackNumber: track.trackNumber,
        year: track.trackYear,
      })),
    };
  }
}
