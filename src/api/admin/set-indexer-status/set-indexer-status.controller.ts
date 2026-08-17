import { AccountEntity } from 'src/database/entities';
import {
  AdminSetIndexerStatusBodyDto,
  AdminSetIndexerStatusResponseDto,
} from './set-indexer-status.dto';
import { AdminSetIndexerStatusService } from './set-indexer-status.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { Body, Controller, Patch } from '@nestjs/common';
import { JWT_TOKEN } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
export class AdminSetIndexerStatusController {
  constructor(
    private readonly setIndexerStatusService: AdminSetIndexerStatusService,
  ) {}

  @Patch('/set-indexer-status')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Scanner status updated successfully',
    type: AdminSetIndexerStatusResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Body() body: AdminSetIndexerStatusBodyDto,
  ): Promise<AdminSetIndexerStatusResponseDto> {
    const { enabled } = body;
    await this.setIndexerStatusService.setScannerStatus(user.id, enabled);
    return { success: true };
  }
}
