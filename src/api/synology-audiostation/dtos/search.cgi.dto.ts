/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../enums';
import { SynologySongDto } from './song.cgi.dto';
import { SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';

class SearchBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Search` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.SEARCH,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `list` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.LIST,
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

export class SynologySearchBodyDto extends SearchBodyDto {
  /**
   * The search phrase to find in the library artists, tracks and albums
   */
  @IsString()
  @IsNotEmpty()
  declare keyword: string;
}

export class SynologySearchAlbumDto {
  @IsString()
  declare album_artist: string;

  @IsString()
  declare display_artist: string;

  @IsString()
  declare name: string;

  @IsString()
  declare artist: string;

  @IsInt()
  declare year: number;
}

export class SynologySearchArtistDto {
  @IsString()
  declare name: string;
}

export class SynologySearchDataDto {
  /**
   * The number of albums found matching the keyword search.
   */
  @IsInt()
  declare albumTotal: number;

  @ApiProperty({
    type: SynologySearchAlbumDto,
    isArray: true,
  })
  declare albums: SynologySearchAlbumDto[];

  /**
   * The number of artists found matching the keyword search.
   */
  @IsInt()
  declare artistTotal: number;

  @ApiProperty({
    type: SynologySearchArtistDto,
    isArray: true,
  })
  declare artists: SynologySearchArtistDto[];

  /**
   * The number of songs found matching the keyword search.
   */
  @IsInt()
  declare songTotal: number;

  @ApiProperty({
    type: SynologySongDto,
    isArray: true,
  })
  declare songs: SynologySongDto[];
}

export class SynologySearchResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologySearchDataDto,
  })
  declare data: SynologySearchDataDto;
}
