/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';
import { ShoutcastItemType } from 'src/types/enums';
import { SynologyApiEnum, SynologyMethodEnum } from '../enums';
import {
  SynologyPaginationResponseDto,
  SynologySuccessResponseDto,
} from './synology.dto';
import { Transform } from 'class-transformer';

class RadioBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Radio` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.RADIO,
  })
  @IsEnum(SynologyApiEnum)
  declare api: SynologyApiEnum;

  /**
   * Refers to the position in the existing data, a value of `-1` indicates a new item.  This
   * is not the pagination offset.
   */
  @IsInt()
  declare offset: number;

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

export class SynologyRadioContainerListBodyDto extends RadioBodyDto {
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
}

export class SynologyRadioItemListBodyDto extends RadioBodyDto {
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
   * The name of the container
   */
  @IsString()
  declare container: string;
}

export class SynologyRadioFavoriteItemDto {
  @IsString()
  declare desc: string;

  @IsString()
  declare title: string;

  @IsString()
  @IsUrl()
  declare url: string;
}

export class SynologyRadioAddOrUpdateItemBodyDto extends RadioBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `updateradios` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.UPDATE_RADIOS,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The name of the container the favorite is in.
   */
  @IsString()
  declare container: string;

  @ApiProperty({
    type: SynologyRadioFavoriteItemDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  declare radios_json: SynologyRadioFavoriteItemDto[];
}

export class SynologyRadioAddUserStationBodyDto extends RadioBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but for AudioStation the
   * endpoints have limited functionality, all music-related endpoints `list` except cover
   * images.  As such this value is ignored for now but defined to match the Synology API.
   *
   * This endpoint requires a value of `add` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.ADD,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * The name of the container the user-defined station is in.
   */
  @IsString()
  declare container: string;

  @IsString()
  declare title: string;

  @IsString()
  declare desc: string;

  @IsString()
  @IsUrl()
  declare url: string;
}

export class SynologyRadioItemDto {
  /**
   * The `desc` value is used for custom-added stations/favorites.
   */
  @IsString()
  declare desc: string;

  @IsString()
  declare id: string;

  @IsString()
  declare title: string;

  /**
   * The `type` value is expected to always be `container` for SHOUTcast genres, and
   * `radio` for actual stations.  Possibly other values for favorites and custom-added
   * stations.
   */
  @ApiProperty({
    enum: ShoutcastItemType,
    enumName: 'ShoutcastItemType',
  })
  @IsEnum(ShoutcastItemType)
  declare type: ShoutcastItemType;

  /**
   * The `url` value is expected to always be an empty string for SHOUTcast genres.
   */
  @IsString()
  @IsUrl()
  @IsOptional()
  declare url: string;
}

export class SynologyRadioItemDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyRadioItemDto,
    isArray: true,
  })
  declare radios: SynologyRadioItemDto[];
}

export class SynologyRadioItemResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyRadioItemDataDto,
  })
  declare data: SynologyRadioItemDataDto;
}
