import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  CollatedArtistTrackEntity,
  CollatedComposerTrackEntity,
  CollatedGenreTrackEntity,
  CollatedTrackEntity,
  GenreEntity,
} from 'src/database/entities';
import { ContentType } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { SynologySongDataDto, SynologySongDto } from './dtos';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';

function songToRow(
  track:
    | CollatedArtistTrackEntity
    | CollatedComposerTrackEntity
    | CollatedGenreTrackEntity
    | CollatedTrackEntity,
): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: track.trackBitRate,
        channel: track.trackChannels,
        codec: track.fileType,
        container: track.fileType,
        duration: track.trackDuration,
        filesize: track.fileSize,
        frequency: track.trackFrequency,
      },
      song_rating: {
        rating: 0,
      },
      song_tag: {
        album: replaceDoubleQuotes(track.albumTitle || ''),
        album_artist: replaceDoubleQuotes(
          replaceDoubleQuotes(track.albumArtists.join(', ')),
        ),
        artist: replaceDoubleQuotes(track.trackArtists.join(', ')),
        comment: replaceDoubleQuotes(track.trackComment || ''),
        composer: '',
        disc: track.trackDiscNumber,
        genre: track.trackGenres.join(', '),
        track: track.trackNumber,
        year: track.trackYear,
      },
    },
    id: `music_${track.fileId}`,
    path: track.filePath,
    title: replaceDoubleQuotes(track.trackTitle),
    type: ContentType.FILE,
  };
}

@Injectable()
export class SynologySongService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
    @InjectModel(CollatedArtistTrackEntity)
    private readonly collatedArtistTrackEntity: typeof CollatedArtistTrackEntity,
    @InjectModel(CollatedGenreTrackEntity)
    private readonly collatedGenreTrackEntity: typeof CollatedGenreTrackEntity,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  async getAlbumByTitleAndArtist(
    accountId: number,
    albumTitle: string,
    albumArtist: string,
  ): Promise<AlbumEntity> {
    const album = await this.albumEntity.findOne({
      attributes: ['id'],
      where: {
        titleNormalized: normalizeString(albumTitle),
        accountId,
      },
      include: [
        {
          model: AlbumArtistEntity,
          attributes: [],
          include: [
            {
              model: ArtistEntity,
              attributes: [],
              where: {
                nameNormalized: normalizeString(albumArtist),
              },
            },
          ],
        },
      ],
    });
    if (!album) {
      throw new NotFoundException(
        `Album not found for title: ${albumTitle} and artist: ${albumArtist}`,
      );
    }
    return album;
  }

  async getArtistByName(artistName: string): Promise<ArtistEntity | null> {
    const artist = await this.artistEntity.findOne({
      where: {
        nameNormalized: normalizeString(artistName),
      },
    });
    return artist;
  }

  async listArtistTracks(
    accountId: number,
    artistName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const artist = await this.getArtistByName(artistName);
    if (!artist) {
      throw new NotFoundException(`Artist not found for name: ${artistName}`);
    }
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('album_artists')),
            artistName.toLocaleLowerCase(),
          ),
        ],
      },
      limit,
      offset,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedArtistTrackEntity.count({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('album_artists')),
            artistName.toLocaleLowerCase(),
          ),
        ],
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listArtistAlbumTracks(
    accountId: number,
    artistName: string,
    albumName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const artist = await this.getArtistByName(artistName);
    if (!artist) {
      throw new NotFoundException(`Artist not found for name: ${artistName}`);
    }
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          { albumTitle: albumName },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('album_artists')),
            artistName.toLocaleLowerCase(),
          ),
        ],
      },
      limit,
      offset,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedArtistTrackEntity.count({
      where: {
        [Op.and]: [
          { accountId },
          { albumTitle: albumName },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('album_artists')),
            artistName.toLocaleLowerCase(),
          ),
        ],
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listComposerTracks(
    accountId: number,
    composerName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('track_composers')),
            composerName.toLocaleLowerCase(),
          ),
        ],
      },
      limit,
      offset,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedTrackEntity.count({
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
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listComposerAlbumTracks(
    accountId: number,
    composerName: string,
    albumName: string,
    albumArtist: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const album = await this.getAlbumByTitleAndArtist(
      accountId,
      albumName,
      albumArtist,
    );
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          { albumId: album.id },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('track_composers')),
            composerName.toLocaleLowerCase(),
          ),
        ],
      },
      limit,
      offset,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedTrackEntity.count({
      where: {
        [Op.and]: [
          { accountId },
          { albumId: album.id },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('track_composers')),
            composerName.toLocaleLowerCase(),
          ),
        ],
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listGenreAlbumTracks(
    accountId: number,
    albumName: string,
    albumArtist: string,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
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
    const album = await this.getAlbumByTitleAndArtist(
      accountId,
      albumName,
      albumArtist,
    );
    const tracks = await this.collatedGenreTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          { albumId: album.id },
          { genreId: { [Op.in]: genres.map((genre) => genre.id) } },
        ],
      },
      limit: limit || 100000,
      offset,
      order: [
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedGenreTrackEntity.count({
      where: {
        [Op.and]: [
          { accountId },
          { albumId: album.id },
          { genreId: { [Op.in]: genres.map((genre) => genre.id) } },
        ],
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listGenreTracks(
    accountId: number,
    genreName: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
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
    const tracks = await this.collatedGenreTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          { genreId: { [Op.in]: genres.map((genre) => genre.id) } },
        ],
      },
      limit: limit || 100000,
      offset,
      order: [
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedGenreTrackEntity.count({
      where: {
        [Op.and]: [
          { accountId },
          { genreId: { [Op.in]: genres.map((genre) => genre.id) } },
        ],
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listAlbumTracks(
    accountId: number,
    albumTitle: string,
    albumArtist: string,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const album = await this.getAlbumByTitleAndArtist(
      accountId,
      albumTitle,
      albumArtist,
    );
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        accountId,
        albumId: album.id,
      },
      limit: limit || 100000,
      offset,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedTrackEntity.count({
      where: {
        accountId,
        albumId: album.id,
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }

  async listTracks(
    accountId: number,
    offset: number,
    limit: number,
  ): Promise<SynologySongDataDto> {
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        accountId,
      },
      offset,
      limit,
      order: [
        ['albumTitle', 'ASC'],
        ['trackDiscNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const total = await this.collatedTrackEntity.count({
      where: {
        accountId,
      },
    });
    return {
      songs: tracks.map(songToRow),
      offset,
      total,
    };
  }
}
