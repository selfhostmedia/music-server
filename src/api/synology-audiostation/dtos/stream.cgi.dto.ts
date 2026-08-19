/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../enums';
import { Transform } from 'class-transformer';

export class StreamCgiQueryDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Stream` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.STREAM,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
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
   * The ID of the song.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the numeric ID so a `music_` prefix is added for Synology, and then stripped off
   * by the `class-transformer` library.
   */
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.id.split('_').pop(), 10))
  declare id: number;
}

export class StreamDto {
  /**
   * The codec of the audio file, e.g. 'flac'
   */
  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare codec: FileTypeEnum;

  /**
   * The size of the audio file in bytes
   */
  @IsInt()
  declare fileSize: number;

  /**
   * The path to the audio file on the server
   */
  @IsString()
  declare path: string;
}
