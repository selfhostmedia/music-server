/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import {
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
} from '../enums';
import { SynologySuccessResponseDto } from './synology.dto';
import { Transform } from 'class-transformer';

export class SynologyInfoBodyDto {
  /**
   * Synology's API uses this value to route requests appropriately but this software has
   * direct endpoints for their relevant URL paths.  As such this value is ignored for now
   * but defined to match the Synology API.
   *
   * This endpoint requires a value of `SYNO.AudioStation.Composer` be provided for correctness.
   */
  @ApiProperty({
    enum: SynologyApiEnum,
    enumName: 'SynologyApiEnum',
    example: SynologyApiEnum.AUDIOSTATION_INFO,
  })
  @IsEnum([SynologyApiEnum.AUDIOSTATION_INFO])
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

class SynologyInfoAmeStatus {
  @IsInt()
  declare ame_major_version: number;

  @IsBoolean()
  declare has_aac: boolean;

  @IsBoolean()
  declare has_license: boolean;

  @IsBoolean()
  declare is_aac_activated: boolean;

  @IsBoolean()
  declare is_ame_broken: boolean;

  @IsBoolean()
  declare is_ame_install: boolean;

  @IsBoolean()
  declare need_aac_transcoding: boolean;
}

class SynologyInfoPrivilege {
  @IsBoolean()
  declare playlist_edit: boolean;

  @IsBoolean()
  declare remote_player: boolean;

  @IsBoolean()
  declare sharing: boolean;

  @IsBoolean()
  declare tag_edit: boolean;

  @IsBoolean()
  declare upnp_browse: boolean;
}

class SynologyInfoSettings {
  @IsBoolean()
  declare audio_show_virtual_library: boolean;

  @IsBoolean()
  declare disable_upnp: boolean;

  @IsBoolean()
  declare enable_download: boolean;

  @IsBoolean()
  declare prefer_using_html5: boolean;

  @IsBoolean()
  declare transcode_to_mp3: boolean;
}

export class SynologyInfoDataDto {
  @ApiProperty({
    type: SynologyInfoAmeStatus,
  })
  declare ame_status: SynologyInfoAmeStatus;

  @IsEnum(SynologyLibraryEnum)
  declare browse_personal_library: SynologyLibraryEnum;

  @IsBoolean()
  declare dsd_decode_capability: boolean;

  @IsBoolean()
  declare enable_equalizer: boolean;

  @IsBoolean()
  declare enable_personal_library: boolean;

  @IsBoolean()
  declare enable_user_home: boolean;

  @IsBoolean()
  declare has_music_share: boolean;

  @IsBoolean()
  declare is_manager: boolean;

  @IsInt()
  declare playing_queue_max: number;

  @ApiProperty({
    type: SynologyInfoPrivilege,
  })
  declare privilege: SynologyInfoPrivilege;

  @IsBoolean()
  declare remote_controller: boolean;

  @IsBoolean()
  declare same_subnet: boolean;

  @IsString()
  declare serial_number: string;

  @ApiProperty({
    type: SynologyInfoSettings,
  })
  declare settings: SynologyInfoSettings;

  @IsString()
  declare sid: string;

  @IsBoolean()
  declare support_bluetooth: boolean;

  @IsBoolean()
  declare support_usb: boolean;

  @IsBoolean()
  declare support_virtual_library: boolean;

  @IsString({ each: true })
  declare transcode_capability: string[];

  @IsInt()
  declare version: number;

  @IsString()
  declare version_string: string;
}

export class SynologyInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyInfoDataDto,
  })
  declare data: SynologyInfoDataDto;
}
