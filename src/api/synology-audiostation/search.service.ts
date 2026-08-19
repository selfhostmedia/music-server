import { CollatedAlbumEntity, CollatedArtistEntity, CollatedTrackEntity } from 'src/database/entities';
import { ContentTypeEnum } from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { SynologySearchAlbumDto, SynologySearchArtistDto, SynologySearchDataDto, SynologySongDto } from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function albumToRow(album: CollatedAlbumEntity): SynologySearchAlbumDto {
  return {
    album_artist: replaceDoubleQuotes(album.artists.join(', ')),
    display_artist: replaceDoubleQuotes(album.artists.join(', ')),
    name: replaceDoubleQuotes(album.title),
    artist: replaceDoubleQuotes(album.artists[0] || ''),
    year: album.year,
  };
}

function artistToRow(artist: CollatedArtistEntity): SynologySearchArtistDto {
  return {
    name: replaceDoubleQuotes(artist.name),
  };
}

function songToRow(song: CollatedTrackEntity): SynologySongDto {
  return {
    additional: {
      song_audio: {
        bitrate: song.trackBitRate,
        channel: song.trackChannels,
        codec: song.fileType,
        container: song.fileType,
        duration: song.trackDuration,
        filesize: song.fileSize,
        frequency: song.trackFrequency,
      },
      song_tag: {
        album: song.albumTitle,
        album_artist: song.albumArtists.join(', '),
        artist: song.trackArtists.join(', '),
        comment: song.trackComment || '',
        composer: song.trackComposers.join(', '),
        disc: song.trackDiscNumber,
        genre: song.trackGenres.join(', '),
        track: song.trackNumber,
        year: song.trackYear,
      },
      song_rating: {
        rating: 0,
      },
    },
    id: song.fileId.toString(),
    path: song.filePath,
    title: song.trackTitle,
    type: ContentTypeEnum.FILE,
  };
}

@Injectable()
export class SynologySearchService {
  constructor(
    @InjectModel(CollatedAlbumEntity)
    private readonly collatedAlbumEntity: typeof CollatedAlbumEntity,
    @InjectModel(CollatedArtistEntity)
    private readonly collatedArtistEntity: typeof CollatedArtistEntity,
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
  ) {}

  async listSearchResults(accountId: number, keyword: string): Promise<SynologySearchDataDto> {
    const albums = await this.collatedAlbumEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('title')), Op.like, `%${keyword.toLocaleLowerCase()}%`),
        ],
      },
    });
    const artists = await this.collatedArtistEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), Op.like, `%${keyword.toLocaleLowerCase()}%`),
        ],
      },
    });
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        [Op.and]: [
          { accountId },
          Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.col('track_title')),
            Op.like,
            `%${keyword.toLocaleLowerCase()}%`,
          ),
        ],
      },
    });
    return {
      albumTotal: albums.length,
      albums: albums.map(albumToRow),
      artistTotal: artists.length,
      artists: artists.map(artistToRow),
      songTotal: tracks.length,
      songs: tracks.map(songToRow),
    };
  }
}
