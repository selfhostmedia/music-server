import {
  AlbumEntity,
  ArtistEntity,
  CollatedAlbumEntity,
  ComposerEntity,
  FileEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import {
  AlbumSortFieldEnum,
  ArtistSortFieldEnum,
  ComposerSortFieldEnum,
  GenreSortFieldEnum,
  SortDirectionEnum,
  TrackSortFieldEnum,
} from 'src/types/enums';
import { ComposerFilters } from './types/composer-filter';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAlbumService } from './album.service';
import { LibraryArtistDto, LibraryArtistWithTracksDto } from './dtos/library.artist.dto';
import { LibraryArtistService } from './artist.service';
import { LibraryComposerDto, LibraryComposerWithTracksDto, LibraryTrackExtendedDto } from './dtos';
import { LibraryComposerService } from './composer.service';
import { LibraryGenreDto, LibraryGenreWithTracksDto } from './dtos/library.genre.dto';
import { LibraryTrackService } from './track.service';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import { TrackFilters } from './types/track-filter';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import type { AlbumFilters } from './types/album-filter';
import type { ArtistFilters } from './types/artist-filter';
import type { ListResult } from './types/list-result';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(CollatedAlbumEntity)
    private readonly collatedAlbumEntity: typeof CollatedAlbumEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,

    private readonly albumService: LibraryAlbumService,
    private readonly artistService: LibraryArtistService,
    private readonly composerService: LibraryComposerService,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    private readonly trackService: LibraryTrackService,
  ) {}

  private async listAllTrackData(whereOptions?: WhereOptions<FileEntity>): Promise<FileEntity[]> {
    return this.fileEntity.findAll({
      attributes: ['id', 'albumId', 'discNumber', 'trackNumber', 'title', 'rating', 'year', 'duration'],
      where: whereOptions,
      include: [
        {
          attributes: ['artistId'],
          model: LinkedArtistEntity,
          include: [
            {
              attributes: ['name'],
              model: ArtistEntity,
              required: true,
            },
          ],
          required: true,
        },
        {
          attributes: ['composerId'],
          model: LinkedComposerEntity,
          include: [
            {
              attributes: ['name'],
              model: ComposerEntity,
              required: true,
            },
          ],
          required: true,
        },
        {
          attributes: ['genreId'],
          model: LinkedGenreEntity,
          include: [
            {
              attributes: ['name'],
              model: GenreEntity,
              required: true,
            },
          ],
          required: true,
        },
      ],
    });
  }

  async listTracks(
    accountId: number,
    filters: TrackFilters,
    offset: number,
    limit: number,
    sortField?: TrackSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryTrackExtendedDto>> {
    const queryFilter = await this.trackService.createTrackQueryFilter(accountId, filters);
    const fileIds = await this.fileEntity.findAll({
      attributes: ['id'],
      ...queryFilter,
    });
    const tracks = await this.trackService.listTracks(
      fileIds.map((file) => file.id),
      offset || 0,
      limit || 100_000,
      sortField,
      sortDirection,
    );
    return {
      total: tracks.count,
      items: tracks.rows.map((track) => ({
        albumId: track.albumId,
        albumTitle: track.album?.title || '',
        albumArtists:
          track.album?.albumArtists?.map((linkedArtist) => {
            return {
              createdAt: linkedArtist.artist?.createdAt || new Date(0),
              id: linkedArtist.artist?.id || 0,
              name: linkedArtist.artist?.name || '',
            };
          }) || [],
        artists:
          track.linkedArtists?.map((linkedArtist) => {
            return {
              createdAt: linkedArtist.artist?.createdAt || new Date(0),
              id: linkedArtist.artist?.id || 0,
              name: linkedArtist.artist?.name || '',
            };
          }) || [],
        comment: track.comment || '',
        composers:
          track.linkedComposers?.map((linkedComposer) => {
            return {
              createdAt: linkedComposer.composer?.createdAt || new Date(0),
              id: linkedComposer.composer?.id || 0,
              name: linkedComposer.composer?.name || '',
            };
          }) || [],
        discNumber: track.discNumber,
        duration: track.duration,
        fileBitRate: track.bitRate,
        fileChannels: track.channels,
        fileFrequency: track.frequency,
        fileId: track.id,
        filePath: track.filePath,
        fileSize: track.fileSize,
        fileType: track.fileType,
        genres:
          track.linkedGenres?.map((linkedGenre) => {
            return {
              createdAt: linkedGenre.genre?.createdAt || new Date(0),
              id: linkedGenre.genre?.id || 0,
              name: linkedGenre.genre?.name || '',
            };
          }) || [],
        id: track.id,
        trackNumber: track.trackNumber,
        rating: track.rating,
        title: track.title,
        year: track.year,
      })),
    };
  }

  /**
   * Returns a list of albums belonging to an account, optionally paginated, filtered and sorted by the
   * specified parameters.
   * @param {number} accountId The user performing the search
   * @param {AlbumFilters} filters The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumDto>>} The album list and total record count.
   */
  async listAlbums(
    accountId: number,
    filters: AlbumFilters,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const sortFieldColumn = this.albumService.sortFieldToColumn(sortField);
    const queryFilter = await this.albumService.createAlbumQueryFilter(accountId, filters);
    const matchingAlbums = await this.albumService.findMatchingAlbumIds(queryFilter);
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
      order: [[Sequelize.fn('lower', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
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
   * @param {number} accountId The user performing the search
   * @param {AlbumFilters} filters The search parameters for the albums
   * @param {number} offset Optional pagination offset
   * @param {number} limit Optional pagination limit
   * @param {AlbumSortFieldEnum} sortField Optional field to sort the results by
   * @param {SortDirectionEnum} sortDirection Optional sort order specification
   * @returns {Promise<ListResult<LibraryAlbumWithTracksDto>>} The album list with tracks and total record count.
   */
  async listAlbumsWithTracks(
    accountId: number,
    filters: AlbumFilters,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumWithTracksDto>> {
    const albums = await this.listAlbums(accountId, filters, offset, limit, sortField, sortDirection);
    const allTracks = await this.listAllTrackData({
      albumId: albums.items.map((album) => album.id),
    });
    const tracksByAlbumId = allTracks.reduce(
      (acc, track) => {
        (acc[track.albumId] ??= []).push(track);
        return acc;
      },
      {} as Record<number, typeof allTracks>,
    );
    return {
      total: albums.total,
      items: albums.items.map((partialAlbum) => {
        const album = partialAlbum as LibraryAlbumWithTracksDto;
        const tracks = tracksByAlbumId[album.id] || [];
        album.tracks = tracks.map((track) => ({
          artists: track.linkedArtists?.map((item) => replaceDoubleQuotes(item.artist?.name || '')) || [''],
          composers: track.linkedComposers?.map((item) => replaceDoubleQuotes(item.composer?.name || '')) || [''],
          discNumber: track.discNumber,
          duration: track.duration,
          fileId: track.id,
          genres: track.linkedGenres?.map((item) => replaceDoubleQuotes(item.genre?.name || '')) || [''],
          id: track.id,
          rating: track.rating,
          title: replaceDoubleQuotes(track.title),
          trackNumber: track.trackNumber,
          year: track.year,
        }));
        return album;
      }),
    };
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of artists with their albums and tracks.
   */
  async listAlbumArtists(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistDto>> {
    const sortFieldColumn = this.artistService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.artistService.createAlbumArtistQueryFilter(accountId, filters);
    const artistIds = await this.artistService.findMatchingArtistIds(queryFilter);
    const artists = await this.artistEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: artistIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
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
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: artists.count,
      items: artists.rows.map((artist) => {
        return {
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters and bundling track lists for all albums.  If the track lists are
   * not required then the `listArtists` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of artists with their albums and tracks.
   */
  async listAlbumArtistsWithTracks(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistWithTracksDto>> {
    const artists = await this.listAlbumArtists(accountId, filters, offset, limit, sortField, sortDirection);
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            artist: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    const albumIndex = {};
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.albumArtists.length; j < jLen; j += 1) {
          const artist = album.albumArtists[j];
          if (artist) {
            albumIndex[artist] = albumIndex[artist] || [];
            const existing = albumIndex[artist].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[artist].push({
                ...album,
                tracks: album.tracks.filter((track) => track.artists.includes(artist)),
              });
            }
          }
        }
        // index as combined artists
        const combined = album.albumArtists.join(', ');
        if (album.albumArtists.length > 1) {
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) => track.artists.includes(combined) || track.artists.join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      total: artists.total,
      items: artists.items
        .map((artist) => ({
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name),
          albums: albumIndex[artist.name] || [],
        }))
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  /**
   * Lists all composers along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.
   * @param {number} accountId The user performing the search
   * @param {ComposerFilters} filters The search parameters for the composers
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ComposerSortFieldEnum} [sortField] The field by which to sort the composers
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryComposerDto>>} The list of composers with their albums and tracks.
   */
  async listComposers(
    accountId: number,
    filters: ComposerFilters,
    offset: number,
    limit: number,
    sortField?: ComposerSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryComposerDto>> {
    const sortFieldColumn = this.composerService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.composerService.createComposerQueryFilter(accountId, filters);
    const composerIds = await this.composerService.findMatchingComposerIds(queryFilter);
    const composers = await this.composerEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: composerIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
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
      subQuery: false,
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: composers.count,
      items: composers.rows.map((composer) => {
        return {
          id: composer.id,
          createdAt: composer.createdAt,
          name: replaceDoubleQuotes(composer.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all composers along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters and bundling track lists for all albums.  If the track lists are
   * not required then the `listComposers` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ComposerFilters} filters The search parameters for the composers
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ComposerSortFieldEnum} [sortField] The field by which to sort the composers
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryComposerDto>>} The list of composers with their albums and tracks.
   */
  async listComposersWithTracks(
    accountId: number,
    filters: ComposerFilters,
    offset: number,
    limit: number,
    sortField?: ComposerSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryComposerWithTracksDto>> {
    const composers = await this.listComposers(accountId, filters, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            composer: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.albumComposers.length; j < jLen; j += 1) {
          const composer = album.albumComposers[j];
          if (composer) {
            albumIndex[composer] = albumIndex[composer] || [];
            const existing = albumIndex[composer].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[composer].push({
                ...album,
                tracks: album.tracks.filter((track) => track.composers.includes(composer)),
              });
            }
          }
        }
        // index as combined composers
        if (album.albumComposers.length > 1) {
          const combined = album.albumComposers.join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) => track.artists.includes(combined) || track.artists.join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      total: composers.total,
      items: composers.items
        .map((composer) => {
          return {
            id: composer.id,
            createdAt: composer.createdAt,
            name: replaceDoubleQuotes(composer.name || ''),
            albums: albumIndex[composer.name] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  /**
   * Lists all artists along with their albums for a given account, optionally paginated, filtered and
   * sorted by the specified parameters.  The difference between this and "album" artists is these
   * names are compiled from track artists information.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the track artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the track artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the track artists
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of track artists with their albums and tracks.
   */
  async listTrackArtists(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistDto>> {
    const sortFieldColumn = this.artistService.sortFieldToColumn(sortField);
    const normalizedFilterString = filters?.filter ? normalizeString(filters.filter) : undefined;
    const queryFilter = await this.artistService.createArtistQueryFilter(accountId, filters);
    const artistIds = await this.artistService.findMatchingArtistIds(queryFilter);
    const artists = await this.artistEntity.findAndCountAll({
      attributes: ['id', 'name', 'createdAt'],
      where: {
        id: artistIds,
        ...(filters?.filter && {
          name: { [Op.like]: `%${normalizedFilterString}%` },
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
      subQuery: false,
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      total: artists.count,
      items: artists.rows.map((artist) => {
        return {
          id: artist.id,
          createdAt: artist.createdAt,
          name: replaceDoubleQuotes(artist.name || ''),
        };
      }),
    };
  }

  /**
   * Lists all track artists along with their albums for a given account, optionally paginated, filtered
   * and sorted by the specified parameters and bundling track lists for all albums.  If the track lists
   * are not required then the `listTrackArtists` method will provide better performance.
   * @param {number} accountId The user performing the search
   * @param {ArtistFilters} filters The search parameters for the track artists
   * @param {number} offset The number of items to skip before starting to collect the result set
   * @param {number} limit The maximum number of items to return
   * @param {ArtistSortFieldEnum} [sortField] The field by which to sort the track artists
   * @param {SortDirectionEnum} [sortDirection] The direction in which to sort the composers
   * @returns {Promise<ListResult<LibraryArtistDto>>} The list of track artists with their albums and tracks.
   */
  async listTrackArtistsWithTracks(
    accountId: number,
    filters: ArtistFilters,
    offset: number,
    limit: number,
    sortField?: ArtistSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryArtistWithTracksDto>> {
    const artists = await this.listTrackArtists(accountId, filters, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(
      accountId,
      filters?.filter
        ? {
            artist: [filters?.filter],
          }
        : {},
      0,
      100_000,
    );
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        const trackArtists = Array.from(new Set(album.tracks.map((track) => track.artists).flat()));
        // get unique track artists for this album
        for (let j = 0, jLen = trackArtists.length; j < jLen; j += 1) {
          const artist = trackArtists[j];
          if (artist) {
            albumIndex[artist] = albumIndex[artist] || [];
            const existing = albumIndex[artist].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[artist].push({
                ...album,
                tracks: album.tracks.filter((track) => track.artists.includes(artist)),
              });
            }
          }
        }
        // index as combined artists
        if (trackArtists.length > 1) {
          const combined = trackArtists.join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existing = albumIndex[combined].find((item) => item.id === album.id);
          if (!existing) {
            albumIndex[combined] = albumIndex[combined] || [];
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter((track) => {
                return track.artists.includes(combined) || track.artists.join(', ') === combined;
              }),
            });
          }
        }
      }
    }
    return {
      total: artists.total,
      items: artists.items
        .map((artist) => {
          return {
            id: artist.id,
            createdAt: artist.createdAt,
            name: replaceDoubleQuotes(artist.name || ''),
            albums: albumIndex[artist.name] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
    };
  }

  async listTrackGenres(
    accountId: number,
    offset: number,
    limit: number,
    sortField?: GenreSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryGenreDto>> {
    let sortFieldColumn: string;
    switch (sortField) {
      case GenreSortFieldEnum.GENRE:
      default:
        sortFieldColumn = 'name';
        break;
    }
    const genres = await this.genreEntity.findAndCountAll({
      where: {
        accountId,
        isDefault: false,
      },
      attributes: ['id', 'name'],
      order: [[Sequelize.fn('LOWER', Sequelize.col(sortFieldColumn)), sortDirection || 'ASC']],
      offset,
      limit,
    });
    return {
      items: genres.rows.map((genre) => {
        return {
          id: genre.id,
          name: genre.name,
        };
      }),
      total: genres.count,
    };
  }

  async listTrackGenresWithTracks(
    accountId: number,
    offset: number,
    limit: number,
    sortField?: GenreSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryGenreWithTracksDto>> {
    const genres = await this.listTrackGenres(accountId, offset, limit, sortField, sortDirection);
    const albumIndex = {};
    const albums = await this.listAlbumsWithTracks(accountId, {}, 0, 100_000);
    for (let i = 0, len = albums.items.length; i < len; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0, jLen = album.albumGenres.length; j < jLen; j += 1) {
          const genre = album.albumGenres[j];
          if (genre) {
            albumIndex[genre] = albumIndex[genre] || [];
            const existing = albumIndex[genre].find((item) => item.id === album.id);
            if (!existing) {
              albumIndex[genre].push({
                ...album,
                tracks: album.tracks.filter((track) => track.genres.includes(genre)),
              });
            }
          }
        }
        // index as combined genres
        if (album.albumGenres.length > 1) {
          const combined = album.albumGenres.join(', ');
          albumIndex[combined] = albumIndex[combined] || [];
          const existingCombined = albumIndex[combined].find((item) => item.id === album.id);
          if (!existingCombined) {
            albumIndex[combined].push({
              ...album,
              tracks: album.tracks.filter(
                (track) => track.genres.includes(combined) || track.genres.join(', ') === combined,
              ),
            });
          }
        }
      }
    }
    return {
      items: genres.items
        .map((genre) => {
          return {
            id: genre.id,
            name: genre.name,
            albums: albumIndex[genre.name] || [],
          };
        })
        .filter((item) => item.albums.filter((album) => album.tracks && album.tracks.length > 0).length > 0),
      total: genres.total,
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
    const tracks = await this.listAllTrackData({
      albumId: album.id,
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
        artists: track.linkedArtists?.map((item) => replaceDoubleQuotes(item.artist?.name || '')) || [''],
        composers: track.linkedComposers?.map((item) => replaceDoubleQuotes(item.composer?.name || '')) || [''],
        discNumber: track.discNumber,
        duration: track.duration,
        fileId: track.id,
        genres: track.linkedGenres?.map((item) => replaceDoubleQuotes(item.genre?.name || '')) || [''],
        id: track.id,
        rating: track.rating,
        title: replaceDoubleQuotes(track.title),
        trackNumber: track.trackNumber,
        year: track.year,
      })),
    };
  }
}
