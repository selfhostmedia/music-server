import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AdminListRootPathsResponseDto } from './list-root-paths.dto';
import { AdminListRootPathsService } from './list-root-paths.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminListRootPathsController {
  constructor(
    private readonly listRootPathsService: AdminListRootPathsService,
  ) {}

  /**
   * Lists all root paths that have been added to the platform.
   */
  @Get('list-root-paths')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminListRootPathsResponseDto,
  })
  async get(): Promise<AdminListRootPathsResponseDto> {
    const rootPaths = await this.listRootPathsService.listRootPaths();
    return {
      rootPaths,
    };
  }
}
