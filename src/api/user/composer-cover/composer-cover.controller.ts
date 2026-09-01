import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserComposerCoverQueryDto } from './composer-cover.dto';
import { UserComposerCoverService } from './composer-cover.service';
import { UserRoleEnum } from 'src/types/enums';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseInterceptors(CacheInterceptor)
export class UserComposerCoverController {
  constructor(private readonly composerCoverService: UserComposerCoverService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('composer-cover')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOperation({
    summary: 'Cover images for composers',
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
  async get(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @User() user: AccountEntity,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() query: UserComposerCoverQueryDto,
  ): Promise<StreamableFile> {
    // const composerCover = await this.composerCoverService.getComposerCoverImage(user.id, query.id, query.size);
    // if (composerCover?.coverImage) {
    //   return new StreamableFile(composerCover.coverImage, {
    //     type: composerCover.coverImageMimeType,
    //     disposition: 'inline',
    //     length: composerCover.coverImage.length,
    //   });
    // }
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    return new StreamableFile(createReadStream(blankCoverPath), {
      type: 'image/png',
    });
  }
}
