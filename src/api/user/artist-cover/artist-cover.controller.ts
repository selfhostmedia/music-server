import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserArtistCoverQueryDto } from './artist-cover.dto';
import { UserArtistCoverService } from './artist-cover.service';
import { UserRoleEnum } from 'src/types/enums';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseInterceptors(CacheInterceptor)
export class UserArtistCoverController {
  constructor(private readonly artistCoverService: UserArtistCoverService) {}

  @Get('artist-cover')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOperation({
    summary: 'Cover images for albums',
  })
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    required: true,
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @Header('Cache-Control', 'private, max-age=600, stale-while-revalidate=60')
  @CacheTTL(60)
  async get(@User() user: AccountEntity, @Query() query: UserArtistCoverQueryDto): Promise<StreamableFile> {
    const albumCover = await this.artistCoverService.getAlbumCoverImage(user.id, query.id, query.size);
    if (albumCover?.coverImage) {
      return new StreamableFile(albumCover.coverImage, {
        type: albumCover.coverImageMimeType,
        disposition: 'inline',
        length: albumCover.coverImage.length,
      });
    }
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    return new StreamableFile(createReadStream(blankCoverPath), {
      type: 'image/png',
    });
  }
}
