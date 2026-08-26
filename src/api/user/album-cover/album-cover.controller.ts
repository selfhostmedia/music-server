import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserAlbumCoverQueryDto } from './album-cover.dto';
import { UserAlbumCoverService } from './album-cover.service';
import { UserRoleEnum } from 'src/constants/enums';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('/api/user')
@ApiTags(USER_APIS)
@UseInterceptors(CacheInterceptor)
export class UserAlbumCoverController {
  constructor(private readonly albumCoverService: UserAlbumCoverService) {}

  @Get('album-cover')
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
  async get(@User() user: AccountEntity, @Query() query: UserAlbumCoverQueryDto): Promise<StreamableFile> {
    const albumCover = await this.albumCoverService.getAlbumCoverImage(user.id, query.id, query.size);
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
