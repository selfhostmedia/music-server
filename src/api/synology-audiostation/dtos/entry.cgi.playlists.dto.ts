/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../enums';
import { Transform } from 'class-transformer';

class SynologyEntryPlaylistRequestDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Playlist` for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.PLAYLIST,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `add_track` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.ADD_TRACK,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * Synology's API has versioned endpoints and some have at least 3 versions.  This software
   * currently only supports the latest version of the API for each endpoint and ignores this value
   * for now.  It's possible to build in support for prior versions of an endpoint but that would
   * require using the `debug-proxy` to capture the request and response payloads to understand the
   * differences between versions.  If you are running an older DSM NAS and wish to help then check
   * out the GitHub Issues page and submit a request to support your version of the API.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare version: number;

  /**
   * The ID of the playlist comes in the format
   * `playlist_<personal|shared>_<normal|smart>/<name>`
   * eg `playlist_personal_normal/playlistname` or `playlist_shared_smart/playlistname`
   */
  @Transform(({ value }) => value.split('/').slice(1).join('/'))
  @IsString()
  declare id: string;
}

export class SynologyEntryPlaylistAddAlbumBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare album: string;

  @IsString()
  declare album_artist: string;
}

export class SynologyEntryPlaylistAddArtistBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare artist: string;
}

export class SynologyEntryPlaylistAddComposerBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare composer: string;
}

export class SynologyEntryPlaylistAddGenreBodyDto extends SynologyEntryPlaylistRequestDto {
  @IsString()
  declare genre: string;
}
