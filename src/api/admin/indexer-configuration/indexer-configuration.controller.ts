import { AdminIndexerConfigurationResponseDto } from './indexer-configuration.dto';
import { AdminIndexerConfigurationService } from './indexer-configuration.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { JWT_TOKEN } from 'src/constants/swagger';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
export class AdminIndexerConfigurationController {
  constructor(
    private readonly indexerConfigurationService: AdminIndexerConfigurationService,
  ) {}

  @Get('/indexer-configuration')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminIndexerConfigurationResponseDto,
  })
  async get(): Promise<AdminIndexerConfigurationResponseDto> {
    const configuration =
      await this.indexerConfigurationService.getIndexerConfiguration();
    return {
      configuration,
      success: true,
    };
  }
}
