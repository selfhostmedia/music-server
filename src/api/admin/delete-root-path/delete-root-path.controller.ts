import {
  AdminDeleteRootPathNotFoundResponseDto,
  AdminDeleteRootPathQueryDto,
  AdminDeleteRootPathResponseDto,
} from './delete-root-path.dto';
import { AdminDeleteRootPathService } from './delete-root-path.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Controller, Delete, Query } from '@nestjs/common';
import { JWT_TOKEN } from 'src/constants/swagger';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
export class AdminDeleteRootPathController {
  constructor(
    private readonly deleteRootPathService: AdminDeleteRootPathService,
  ) {}

  /**
   * Deletes a root path from the platform.
   */
  @Delete('delete-root-path')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Root path deleted successfully',
    type: AdminDeleteRootPathResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Root path not found',
    type: AdminDeleteRootPathNotFoundResponseDto,
  })
  async delete(
    @Query() query: AdminDeleteRootPathQueryDto,
  ): Promise<AdminDeleteRootPathResponseDto> {
    await this.deleteRootPathService.delete(query.id);
    return {
      success: true,
    };
  }
}
