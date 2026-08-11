/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../enums';
import { SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';

export class SynologyEntryCertificateBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Encryption` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.ENCRYPTION,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `getinfo` for the `method` value for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.GET_INFO,
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
}

export class SynologyEntryCertificateDataDto {
  @ApiProperty({
    example: '__cIpHeRtExT',
  })
  @IsString()
  @IsEnum(['__cIpHeRtExT'])
  declare cipherkey: string;

  @ApiProperty({
    example: '__cIpHeRtOkEn',
  })
  @IsString()
  @IsEnum(['__cIpHeRtOkEn'])
  declare ciphertoken: string;

  /**
   * RSA-4096 public key
   */
  @IsString()
  declare public_key: string;

  /**
   * UNIX-timestamp in seconds
   */
  @IsInt()
  declare server_time: number;
}

export class SynologyEntryCertificateResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyEntryCertificateDataDto,
  })
  declare data: SynologyEntryCertificateDataDto;
}
