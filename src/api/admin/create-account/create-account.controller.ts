import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminCreateAccountBadRequestResponseDto,
  AdminCreateAccountBodyDto,
  AdminCreateAccountResponseDto,
} from './create-account.dto';
import { AdminCreateAccountService } from './create-account.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminCreateAccountController {
  constructor(
    private readonly createAccountService: AdminCreateAccountService,
  ) {}

  /**
   * Creates a user account granting them access to the music server. This endpoint is only
   * accessible to users with the ADMIN role.
   */
  @Post('create-account')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiCreatedResponse({
    type: AdminCreateAccountResponseDto,
  })
  @ApiBadRequestResponse({
    type: AdminCreateAccountBadRequestResponseDto,
  })
  @ApiBadRequestResponse({ type: AdminCreateAccountBadRequestResponseDto })
  async post(
    @Body() body: AdminCreateAccountBodyDto,
  ): Promise<AdminCreateAccountResponseDto> {
    await this.createAccountService.post(body);
    return {
      success: true,
    };
  }
}
