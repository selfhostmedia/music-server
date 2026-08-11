import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import {
  SynologyApiEnum,
  SynologyMethodEnum,
  SynologyQueryEnum,
} from '../enums';
import { Transform } from 'class-transformer';

export class QueryCgiBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.API.Info` for the `api` for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.INFO,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `query` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.QUERY,
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
   * It is not clear what Synology uses this for, but requests to `query.cgi` and `entry.cgi` return
   * hardcoded responses so this value is ignored for now but defined to match the Synology API.
   */
  @ApiProperty({
    enum: SynologyQueryEnum,
    enumName: 'SynologyQueryEnum',
    required: false,
  })
  @IsOptional()
  @IsEnum(SynologyQueryEnum)
  declare query?: SynologyQueryEnum;
}
