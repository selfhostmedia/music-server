/* eslint-disable max-classes-per-file */
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsString, ValidateIf } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum, SynologyPinType } from '../enums';
import {
  SynologyPaginationDto,
  SynologyPaginationResponseDto,
  SynologySuccessResponseDto,
} from './synology.dto';
import { Transform } from 'class-transformer';

class SynologyEntryPinItemCriteriaDto {
  @IsString()
  album?: string;

  @IsString()
  album_artist?: string;

  @IsString()
  artist?: string;

  @IsString()
  composer?: string;

  @IsInt()
  @Transform(({ value }) => Number.parseInt(value, 10))
  @ValidateIf((o) => o.folder?.length)
  folder?: string;

  @IsString()
  genre?: string;

  @IsString()
  playlist?: string;
}

export class SynologyEntryNewPinItemDto {
  @ApiProperty({
    type: SynologyEntryPinItemCriteriaDto,
  })
  declare criteria: SynologyEntryPinItemCriteriaDto;

  @IsString()
  declare name: string;

  @ApiProperty({
    enum: SynologyPinType,
    enumName: 'SynologyPinType',
  })
  @IsEnum(SynologyPinType)
  declare type: SynologyPinType;
}

export class SynologyEntryPinItemDto extends PickType(
  SynologyEntryNewPinItemDto,
  ['criteria', 'name', 'type'],
) {
  @IsString()
  declare id: string;
}

class SynologyEntryPinRequestDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Pin` for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.PIN,
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

export class SynologyEntryListPinsBodyDto extends IntersectionType(
  SynologyEntryPinRequestDto,
  SynologyPaginationDto,
) {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
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

export class SynologyEntryCreatePinBodyDto extends SynologyEntryPinRequestDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `pin` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.PIN,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * List of item details to pin
   */
  @ApiProperty({
    type: SynologyEntryNewPinItemDto,
    isArray: true,
  })
  @Transform(({ value }) => {
    const parsed = JSON.parse(value);
    return parsed.map((item: SynologyEntryNewPinItemDto) => ({
      ...item,
      type: item.type as SynologyPinType,
    }));
  })
  declare items: SynologyEntryNewPinItemDto[];
}

export class SynologyEntryDeletePinBodyDto extends SynologyEntryPinRequestDto {
  /**
   * Synology's API uses this value to route requests appropriately but NestJS controllers
   * handle the routing between URL paths so this value is ignored for now but defined to
   * match the Synology API.
   *
   * This endpoint requires a value of `unpin` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyMethodEnum,
    enumName: 'SynologyMethodEnum',
    example: SynologyMethodEnum.UNPIN,
  })
  @IsEnum(SynologyMethodEnum)
  declare method: SynologyMethodEnum;

  /**
   * List of item IDs to unpin
   */
  @ApiProperty({
    isArray: true,
  })
  @IsNumber(undefined, { each: true })
  @Transform(({ value }) =>
    JSON.parse(value).map((id: string) => Number.parseInt(id, 10)),
  )
  declare items: number[];
}

export class SynologyEntryPinsDataDto extends SynologyPaginationResponseDto {
  @ApiProperty({
    type: SynologyEntryPinItemDto,
    isArray: true,
  })
  declare items: SynologyEntryPinItemDto[];
}

export class SynologyEntryListPinsResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyEntryPinsDataDto,
  })
  declare data: SynologyEntryPinsDataDto;
}
