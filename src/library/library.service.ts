import { AlbumEntity, ArtistEntity, CollatedAlbumEntity, CollatedTrackEntity } from 'src/database/entities';
import { AlbumSortFieldEnum, ArtistSortFieldEnum, SortDirectionEnum } from 'src/types/enums';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LibraryAlbumDto, LibraryAlbumWithTracksDto } from './dtos/library.album.dto';
import { LibraryAlbumService } from './album.service.ts';
import { LibraryArtistDto, LibraryArtistWithTracksDto } from './dtos/library.artist.dto';
import { LibraryArtistService } from './artist.service';
import { Op, Sequelize } from 'sequelize';
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
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,

    private readonly albumService: LibraryAlbumService,
    private readonly artistService: LibraryArtistService,
  ) {}

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
    filter: AlbumFilters,
    offset: number,
    limit: number,
    sortField?: AlbumSortFieldEnum,
    sortDirection?: SortDirectionEnum,
  ): Promise<ListResult<LibraryAlbumDto>> {
    const sortFieldColumn = this.albumService.sortFieldToColumn(sortField);
    const queryFilter = await this.albumService.createAlbumQueryFilter(accountId, filter);
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
    const allTracks = await this.collatedTrackEntity.findAll({
      where: {
        albumId: albums.items.map((album) => album.id),
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
      total: albums.total,
      items: albums.items.map((partialAlbum) => {
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
    for (let i = 0; i < albums.items.length; i += 1) {
      const album = albums.items[i];
      if (album) {
        for (let j = 0; j < album.albumArtists.length; j += 1) {
          const artist = album.albumArtists[j];
          if (artist) {
            if (!albumIndex[artist]) {
              albumIndex[artist] = [];
            }
            albumIndex[artist].push(album);
          }
        }
      }
    }
    const allTracks = await this.collatedTrackEntity.findAll({
      where: {
        albumId: albums.items.map((album) => album.id),
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
      total: artists.total,
      items: artists.items.map((artist) => ({
        id: artist.id,
        createdAt: artist.createdAt,
        name: replaceDoubleQuotes(artist.name),
        albums: (albumIndex[artist.name] || []).map((partialAlbum) => {
          const album = partialAlbum as LibraryAlbumWithTracksDto;
          const tracks = tracksByAlbumId[album.id]?.filter((track) => track.trackArtists.includes(artist.name)) || [];
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
      })),
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
