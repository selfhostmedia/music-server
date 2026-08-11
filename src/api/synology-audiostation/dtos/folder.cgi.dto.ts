/* eslint-disable max-classes-per-file */
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContentType } from 'src/types/enums';
import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import {
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
} from '../enums';
import {
  SynologyPaginationDto,
  SynologyPaginationResponseDto,
  SynologySuccessResponseDto,
} from './synology.dto';
import { SynologySongDto } from './song.cgi.dto';
import { Transform } from 'class-transformer';

class FolderBodyDto extends SynologyPaginationDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Folder` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.FOLDER,
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

export class SynologyRootFolderBodyDto extends FolderBodyDto {}

export class SynologyFolderBodyDto extends FolderBodyDto {
  /**
   * The ID of the folder.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the path so an ID will arrive like `/music/artist/album/cd1`
   */
  @Transform(({ value }) => Number(value.split('_').pop()))
  @IsInt()
  declare id: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  declare recursive: boolean;

  @IsString()
  declare additional: string;
}

export class SynologyFolderDto {
  /**
   * The ID value for the folder, for a root path this will be `root_n` otherwise `dir_n` where `n`
   * is the numeric ID of the folder.
   */
  declare id: string;

  /**
   * Indicates whether the folder is a personal folder or a shared folder, however there is no
   * shared folder equivalent in this software so this value is ignored for now but defined to
   * match the Synology API.
   */
  declare is_personal: boolean;

  /**
   * The fully-qualified path to the file
   */
  declare path: string;

  /**
   * The final segment of the folder path
   */
  declare title: string;

  /**
   * The content type, folder or file
   */
  @ApiProperty({
    enum: ContentType,
    enumName: 'ContentType',
  })
  @IsEnum(ContentType)
  declare type: ContentType;
}

export class SynologyFolderDataDto extends SynologyPaginationResponseDto {
  /**
   * The number of folders included in the response, this may be less than the total number if there is
   * a combination of folders and files in the directory.
   */
  @IsInt()
  declare folder_total: number;

  /**
   * The ID of the folder currently in scope.  Synology uses a string with a prefix and the numeric ID, this
   * software only uses the path since folders are not tracked separately they are derived from the file paths.
   */
  @IsString()
  declare id?: string;

  @ApiProperty({
    isArray: true,
    type: 'array',
    items: {
      oneOf: [
        { $ref: getSchemaPath(SynologyFolderDto) },
        { $ref: getSchemaPath(SynologySongDto) },
      ],
    },
  })
  declare items: (SynologyFolderDto | SynologySongDto)[];
}

export class SynologyFolderResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyFolderDataDto,
  })
  declare data: SynologyFolderDataDto;
}
