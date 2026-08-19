import { AUTHENTICATED_REQUEST_DESCRIPTION, PAGINATED_DATA_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CACHE_MANAGER, Cache, CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, HttpCode, HttpStatus, Inject, Logger, Query, Res, UseInterceptors } from '@nestjs/common';
import { CoverCgiAlbumQueryDto, CoverCgiArtistQueryDto, CoverCgiComposerQueryDto, CoverCgiSongQueryDto } from './dtos';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyCoverImageService } from './cover-image.service';
import { User } from '../user.decorator';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseInterceptors(CacheInterceptor)
export class SynologyCoverImageController {
  private readonly logger: Logger = new Logger(SynologyCoverImageController.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly coverImageService: SynologyCoverImageService,
  ) {}

  @Get('/webapi/AudioStation/cover.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the cover image for an album, artist, composer or song',
    description: [
      // eslint-disable-next-line max-len
      `Retrieves the cover image for an album, artist, composer or song.  The cover image can be retrieved by specifying the appropriate query parameters in the request.  If an image is not found a default blank cover image will be returned.`,
      PAGINATED_DATA_DESCRIPTION,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  async route(
    @User() user: AccountEntity,
    @Query()
    query:
      | CoverCgiAlbumQueryDto
      | CoverCgiArtistQueryDto
      | CoverCgiComposerQueryDto
      | CoverCgiSongQueryDto
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | any, // TODO: there are some query parameters that are not yet defined in the DTO
    @Res() res: Response,
  ) {
    const cacheKey = JSON.stringify(query);
    const cachedValue = await this.cacheManager.get<string>(cacheKey);
    if (cachedValue) {
      return cachedValue;
    }
    let album;
    if ('id' in query) {
      album = await this.coverImageService.getFileCoverImage(user.id, query.id);
    } else if ('artist_name' in query) {
      album = await this.coverImageService.getArtistCoverImage(user.id, query.artist_name);
    } else if ('album_name' in query) {
      album = await this.coverImageService.getAlbumCoverImage(user.id, query.album_artist_name, query.album_name);
    } else if ('composer_name' in query) {
      album = await this.coverImageService.getComposerCoverImage(user.id, query.composer_name);
    }
    if (album?.coverImage) {
      await this.cacheManager.set(cacheKey, album, 300);
      res.writeHead(206, {
        'content-type': album.coverImageMimeType,
        'content-length': album.coverImage.length,
      });
      return res.end(album.coverImage);
    }
    res.setHeader('Content-Type', 'image/png');
    const blankCoverPath = join(__dirname, 'requests', 'blank-cover.png');
    const file = createReadStream(blankCoverPath);
    return file.pipe(res);
  }
}
