import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminRegenerateUserSessionKeyNotFoundResponseDto,
  AdminRegenerateUserSessionKeyQueryDto,
  AdminRegenerateUserSessionKeyResponseDto,
} from './regenerate-user-sessionkey.dto';
import { AdminRegenerateUserSessionKeyService } from './regenerate-user-sessionkey.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Patch, Query } from '@nestjs/common';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: 'api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminRegenerateUserSessionKeyController {
  constructor(
    private readonly regenerateSessionKeyService: AdminRegenerateUserSessionKeyService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Patch('regenerate-user-sessionkey')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminRegenerateUserSessionKeyResponseDto,
    description: 'Session key regenerated successfully',
  })
  @ApiNotFoundResponse({
    type: AdminRegenerateUserSessionKeyNotFoundResponseDto,
    description: 'Account not found',
  })
  async patch(
    @Query() query: AdminRegenerateUserSessionKeyQueryDto,
  ): Promise<AdminRegenerateUserSessionKeyResponseDto> {
    await this.regenerateSessionKeyService.regenerateSessionKey(
      query.accountId,
    ); // Replace with the actual account ID
    return {
      success: true,
    };
  }
}
