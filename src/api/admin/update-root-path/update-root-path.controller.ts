import {
  AdminUpdateRootPathBadRequestResponseDto,
  AdminUpdateRootPathBodyDto,
  AdminUpdateRootPathNotFoundResponseDto,
  AdminUpdateRootPathQueryDto,
  AdminUpdateRootPathResponseDto,
} from './update-root-path.dto';
import { AdminUpdateRootPathService } from './update-root-path.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Body, Controller, Patch, Query } from '@nestjs/common';
import { JWT_TOKEN } from 'src/constants/swagger';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
export class AdminUpdateRootPathController {
  constructor(
    private readonly updateRootPathService: AdminUpdateRootPathService,
  ) {}

  /**
   * Updates a root path
   */
  @Patch('update-root-path')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminUpdateRootPathResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Root path not found',
    type: AdminUpdateRootPathNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid root path, either malformed or nonexistent',
    type: AdminUpdateRootPathBadRequestResponseDto,
  })
  async patch(
    @Query() query: AdminUpdateRootPathQueryDto,
    @Body() body: AdminUpdateRootPathBodyDto,
  ): Promise<AdminUpdateRootPathResponseDto> {
    await this.updateRootPathService.updateRootPath(query.id, body.newPath);
    return {
      success: true,
    };
  }
}
