import { AccountEntity, SessionEntity } from 'src/database/entities';
import { AllowGuest } from '../role.guard';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Session } from '../session.decorator';
import { SynologyApiEnum, SynologyMethodEnum } from './enums';
import {
  SynologyEntryCertificateBodyDto,
  SynologyEntryCertificateResponseDto,
  SynologyEntryCreatePinBodyDto,
  SynologyEntryDeletePinBodyDto,
  SynologyEntryListPinsBodyDto,
  SynologyEntryListPinsResponseDto,
  SynologyEntryLogoutBodyDto,
  SynologyEntryLogoutResponseDto,
  SynologyEntryPlaylistAddAlbumBodyDto,
  SynologyEntryPlaylistAddArtistBodyDto,
  SynologyEntryPlaylistAddComposerBodyDto,
  SynologyEntryPlaylistAddGenreBodyDto,
  SynologyEntrySignInBodyDto,
  SynologyEntrySignInResponseDto,
} from './dtos';
import { SynologyEntryService } from './entry.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyEntryController {
  private readonly logger: Logger = new Logger(SynologyEntryController.name);

  constructor(private readonly entryService: SynologyEntryService) {}

  /**
   * The `entry.cgi` endpoint collates a bunch of system endpoints pertaining to session management, user
   * settings and system information.
   * @returns
   */
  @Post('/webapi/entry.cgi')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user if requesting "pins" or "logout" methods',
    required: false,
  })
  @ApiOkResponse({
    description: 'Handles various entry.cgi requests',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(SynologyEntryCertificateResponseDto) },
        { $ref: getSchemaPath(SynologyEntrySignInResponseDto) },
        { $ref: getSchemaPath(SynologyEntryListPinsResponseDto) },
        { $ref: getSchemaPath(SynologyEntryLogoutResponseDto) },
        { $ref: getSchemaPath(SynologySuccessResponseDto) },
      ],
    },
  })
  @ApiExtraModels(
    SynologyEntryCertificateBodyDto,
    SynologyEntrySignInBodyDto,
    SynologyEntryListPinsBodyDto,
    SynologyEntryCreatePinBodyDto,
    SynologyEntryDeletePinBodyDto,
    SynologyEntryLogoutBodyDto,
    SynologyEntryPlaylistAddAlbumBodyDto,
    SynologyEntryPlaylistAddArtistBodyDto,
    SynologyEntryPlaylistAddComposerBodyDto,
    SynologyEntryPlaylistAddGenreBodyDto,
    SynologyEntryCertificateResponseDto,
    SynologyEntrySignInResponseDto,
    SynologyEntryListPinsResponseDto,
    SynologyEntryLogoutResponseDto,
    SynologySuccessResponseDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyEntryCertificateBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntrySignInBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryListPinsBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryLogoutBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryCreatePinBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryDeletePinBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryPlaylistAddAlbumBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryPlaylistAddArtistBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryPlaylistAddComposerBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyEntryPlaylistAddGenreBodyDto),
        },
      ],
    },
  })
  async postEntryCgi(
    @Headers() headers: string,
    @Headers('user-agent') userAgent: string,
    @Body()
    variousBodies:
      | SynologyEntryCertificateBodyDto
      | SynologyEntryCreatePinBodyDto
      | SynologyEntryDeletePinBodyDto
      | SynologyEntrySignInBodyDto
      | SynologyEntryListPinsBodyDto
      | SynologyEntryLogoutBodyDto
      | SynologyEntryPlaylistAddAlbumBodyDto
      | SynologyEntryPlaylistAddArtistBodyDto
      | SynologyEntryPlaylistAddComposerBodyDto
      | SynologyEntryPlaylistAddGenreBodyDto,
    @Res({ passthrough: true }) response: Response,
    @User() user?: AccountEntity,
    @Session() session?: SessionEntity,
  ): Promise<
    | SynologyEntryCertificateResponseDto
    | SynologyEntrySignInResponseDto
    | SynologyEntryListPinsResponseDto
    | SynologyEntryLogoutResponseDto
    | SynologySuccessResponseDto
  > {
    // Route #1: requesting encryption key and field names
    if (
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.ENCRYPTION &&
      variousBodies.method === SynologyMethodEnum.GET_INFO
    ) {
      return this.getEncryptionKey();
    }
    // Route #2: signing in with encrypted username/password credentials
    if (!('api' in variousBodies) && '__cIpHeRtExT' in variousBodies) {
      return this.signIn(
        userAgent,
        plainToInstance(SynologyEntrySignInBodyDto, variousBodies),
        response,
      );
    }
    // Route #3: returns pinned items
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.LIST
    ) {
      return this.listPinnedItems(
        user,
        plainToInstance(SynologyEntryListPinsBodyDto, variousBodies),
      );
    }
    // Route #4: pinning items
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.PIN
    ) {
      return this.createPinnedItem(
        user,
        plainToInstance(SynologyEntryCreatePinBodyDto, variousBodies),
      );
    }
    // Route #5: unpinning an item
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.UNPIN
    ) {
      return this.deletePinnedItem(
        user,
        plainToInstance(SynologyEntryDeletePinBodyDto, variousBodies),
      );
    }
    // Route #6: logging out, for some reason a request may be made without user/session
    if (
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.AUTH &&
      variousBodies.method === SynologyMethodEnum.LOGOUT
    ) {
      return this.logout(user, session);
    }
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PLAYLIST &&
      variousBodies.method === SynologyMethodEnum.ADD_TRACK
    ) {
      // Route #7: adding albums to a playlist
      if ('album' in variousBodies) {
        return this.addAlbumToPlaylist(
          user,
          plainToInstance(SynologyEntryPlaylistAddAlbumBodyDto, variousBodies),
        );
      }
      // Route #8: adding artists to a playlist
      if ('artist' in variousBodies) {
        return this.addArtistToPlaylist(
          user,
          plainToInstance(SynologyEntryPlaylistAddArtistBodyDto, variousBodies),
        );
      }
      // Route #9: adding composers to a playlist
      if ('composer' in variousBodies) {
        return this.addComposerToPlaylist(
          user,
          plainToInstance(
            SynologyEntryPlaylistAddComposerBodyDto,
            variousBodies,
          ),
        );
      }
      // Route #10: adding genres to a playlist
      if ('genre' in variousBodies) {
        return this.addGenreToPlaylist(
          user,
          plainToInstance(SynologyEntryPlaylistAddGenreBodyDto, variousBodies),
        );
      }
    }
    throw new BadRequestException(
      `Invalid request body for entry.cgi: ${JSON.stringify(variousBodies, null, 2)}, ${JSON.stringify(headers, null, 2)}`,
    );
  }

  private async getEncryptionKey(): Promise<SynologyEntryCertificateResponseDto> {
    const data = this.entryService.getEncryptionKey();
    return {
      data,
      success: true,
    };
  }

  private async signIn(
    userAgent: string,
    body: SynologyEntrySignInBodyDto,
    response: Response,
  ): Promise<SynologyEntrySignInResponseDto> {
    const data = await this.entryService.authenticate(userAgent, body);
    response.cookie('id', data.sid, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000),
    });
    response.cookie('did', data.did, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000),
    });
    return {
      data,
      success: true,
    };
  }

  private async logout(
    user?: AccountEntity,
    session?: SessionEntity,
  ): Promise<SynologyEntryLogoutResponseDto> {
    if (user && session) {
      const success = await this.entryService.logout(user.id, session.id);
      if (!success) {
        throw new BadRequestException({
          success: false,
          message: 'Failed to log out',
        });
      }
    }
    return {
      success: true,
    };
  }

  private async listPinnedItems(
    user: AccountEntity,
    body: SynologyEntryListPinsBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.listPinnedItems(
      user.id,
      body.offset,
      body.limit,
    );
    return {
      data,
      success: true,
    };
  }

  private async createPinnedItem(
    user: AccountEntity,
    body: SynologyEntryCreatePinBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.createPinnedItem(user.id, body.items);
    return {
      data,
      success: true,
    };
  }

  private async deletePinnedItem(
    user: AccountEntity,
    body: SynologyEntryDeletePinBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.deletePinnedItem(user.id, body.items);
    return {
      data,
      success: true,
    };
  }

  private async addAlbumToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddAlbumBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addAlbumToPlaylist(
      user.id,
      body.id,
      body.album,
      body.album_artist,
    );
    return {
      success: true,
    };
  }

  private async addArtistToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddArtistBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addArtistToPlaylist(user.id, body.id, body.artist);
    return {
      success: true,
    };
  }

  private async addComposerToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddComposerBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addComposerToPlaylist(
      user.id,
      body.id,
      body.composer,
    );
    return {
      success: true,
    };
  }

  private async addGenreToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddGenreBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addGenreToPlaylist(user.id, body.id, body.genre);
    return {
      success: true,
    };
  }
}
