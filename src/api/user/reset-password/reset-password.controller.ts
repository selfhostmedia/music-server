import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Scope } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserResetPasswordBadRequestResponseDto,
  UserResetPasswordBodyDto,
  UserResetPasswordResponseDto,
} from './reset-password.dto';
import { UserResetPasswordService } from './reset-password.service';
import { UserRoleEnum } from 'src/constants/enums';

@Controller({
  path: '/api/user',
  scope: Scope.REQUEST,
})
@ApiTags(USER_APIS)
export class UserResetPasswordController {
  constructor(private readonly resetPasswordService: UserResetPasswordService) {}

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: `Resets the user's password to a new value.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: UserResetPasswordResponseDto,
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    type: UserResetPasswordBadRequestResponseDto,
    description: 'Invalid request data or additional requirements not met',
  })
  async post(
    @User() user: AccountEntity,
    @Body() body: UserResetPasswordBodyDto,
  ): Promise<UserResetPasswordResponseDto> {
    await this.resetPasswordService.resetUserPassword(user.id, body.newPassword);
    return {
      success: true,
    };
  }
}
