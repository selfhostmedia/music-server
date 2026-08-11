/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../enums';
import { SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';

class ProxyBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Proxy` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.PROXY,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

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
}

export class SynologyProxySongInfoBodyDto extends ProxyBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `getsonginfo` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_SONG_INFO,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The SHOUTcast stream ID
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxyStreamQueryDto extends ProxyBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `stream` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.STREAM,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The SHOUTcast stream ID
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxyStreamInfoBodyDto extends ProxyBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `getstreamid` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_STREAM_ID,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The title of the SHOUTcast radio station
   */
  @IsString()
  declare id: string;
}

export class SynologyProxyDeleteSongInfoBodyDto extends ProxyBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `deletesonginfo` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.DELETE_SONG_INFO,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The array index of the song to delete from the SHOUTcast radio station
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxySongInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty()
  declare data: {
    title: string;
  };
}

export class SynologyProxyStreamInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty()
  declare data: {
    stream_id: string;
    format: string;
  };
}
