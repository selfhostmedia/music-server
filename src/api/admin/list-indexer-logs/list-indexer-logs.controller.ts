import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminListIndexerLogsBadRequestResponseDto,
  AdminListIndexerLogsNotFoundResponseDto,
  AdminListIndexerLogsQueryDto,
  AdminListIndexerLogsResponseDto,
} from './list-indexer-logs.dto';
import { AdminListIndexerLogsService } from './list-indexer-logs.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: 'api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminListIndexerLogsController {
  constructor(
    private readonly listIndexerLogsService: AdminListIndexerLogsService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('list-indexer-logs')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminListIndexerLogsResponseDto,
  })
  @ApiBadRequestResponse({
    type: AdminListIndexerLogsBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    type: AdminListIndexerLogsNotFoundResponseDto,
  })
  async get(
    @Query() query: AdminListIndexerLogsQueryDto,
  ): Promise<AdminListIndexerLogsResponseDto> {
    const logs = await this.listIndexerLogsService.list(
      query.accountId,
      query.rootPathId,
      query.search,
    );
    return {
      logs,
      success: true,
    };
  }
}
