import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminResetUserPasswordBadRequestResponseDto,
  AdminResetUserPasswordBodyDto,
  AdminResetUserPasswordNotFoundResponseDto,
  AdminResetUserPasswordQueryDto,
  AdminResetUserPasswordResponseDto,
} from './reset-user-password.dto';
import { AdminResetUserPasswordService } from './reset-user-password.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Patch, Query } from '@nestjs/common';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: 'api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminResetUserPasswordController {
  constructor(
    private readonly resetPasswordService: AdminResetUserPasswordService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Patch('reset-user-password')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminResetUserPasswordResponseDto,
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    type: AdminResetUserPasswordBadRequestResponseDto,
    description: 'Invalid request data or additional requirements not met',
  })
  @ApiNotFoundResponse({
    type: AdminResetUserPasswordNotFoundResponseDto,
    description: 'Account not found',
  })
  async patch(
    @Query() query: AdminResetUserPasswordQueryDto,
    @Body() body: AdminResetUserPasswordBodyDto,
  ): Promise<AdminResetUserPasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(
      query.accountId,
      body.newPassword,
    );
    return {
      success: true,
    };
  }
}
