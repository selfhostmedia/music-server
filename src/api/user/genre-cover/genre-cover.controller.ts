import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserGenreCoverQueryDto } from './genre-cover.dto';
import { UserGenreCoverService } from './genre-cover.service';
import { UserRoleEnum } from 'src/types/enums';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseInterceptors(CacheInterceptor)
export class UserGenreCoverController {
  constructor(private readonly genreCoverService: UserGenreCoverService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('genre-cover')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOperation({
    summary: 'Cover images for genres',
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
    @Query() query: UserGenreCoverQueryDto,
  ): Promise<StreamableFile> {
    // const genreCover = await this.genreCoverService.getGenreCoverImage(user.id, query.id, query.size);
    // if (genreCover?.coverImage) {
    //   return new StreamableFile(genreCover.coverImage, {
    //     type: genreCover.coverImageMimeType,
    //     disposition: 'inline',
    //     length: genreCover.coverImage.length,
    //   });
    // }
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    return new StreamableFile(createReadStream(blankCoverPath), {
      type: 'image/png',
    });
  }
}
