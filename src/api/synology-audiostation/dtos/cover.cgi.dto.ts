/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { Transform } from 'class-transformer';

class CoverQueryDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Cover` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.COVER,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `getcover` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_COVER,
  })
  @IsEnum([SynologyMethodEnum.GET_COVER])
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
   * Synology supports having personal and shared libraries but this software does not have a
   * direct equivalent, users can add the same root path to achieve it.  As such this value
   * is ignored but defined to match the Synology API.
   *
   * This endpoint requires a value of `all` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyLibraryEnum,
    enumName: 'SynologyLibraryEnum',
    example: SynologyLibraryEnum.ALL,
  })
  @IsEnum(SynologyLibraryEnum)
  declare library: SynologyLibraryEnum;
}

export class CoverCgiAlbumQueryDto extends CoverQueryDto {
  /**
   * The title of the album
   */
  @IsString()
  declare album_name: string;

  /**
   * The name of the album artist
   */
  @IsString()
  declare album_artist_name: string;
}

export class CoverCgiArtistQueryDto extends CoverQueryDto {
  /**
   * The name of the album artist
   */
  @IsString()
  declare artist_name: string;
}

export class CoverCgiComposerQueryDto extends CoverQueryDto {
  /**
   * The name of the composer
   */
  @IsString()
  declare composer_name: string;
}

export class CoverCgiSongQueryDto extends CoverQueryDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `getsongcover` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_SONG_COVER,
  })
  @IsEnum([SynologyMethodEnum.GET_SONG_COVER])
  declare method: SynologyMethodEnum;

  /**
   * The ID of the song.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the numeric ID so a `music_` prefix is added for Synology, and then stripped off
   * by the `class-transformer` library.
   */
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  @IsInt()
  declare id: number;
}
