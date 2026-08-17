import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminUpdateUserRolesBadRequestResponseDto,
  AdminUpdateUserRolesBodyDto,
  AdminUpdateUserRolesNotFoundResponseDto,
  AdminUpdateUserRolesQueryDto,
  AdminUpdateUserRolesResponseDto,
} from './update-user-roles.dto';
import { AdminUpdateUserRolesService } from './update-user-roles.service';
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
import { User } from 'src/api/user.decorator';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: 'api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminUpdateUserRolesController {
  constructor(
    private readonly updateRolesService: AdminUpdateUserRolesService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Patch('update-user-roles')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminUpdateUserRolesResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    type: AdminUpdateUserRolesNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid user role or account only admin error',
    type: AdminUpdateUserRolesBadRequestResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Query() query: AdminUpdateUserRolesQueryDto,
    @Body() body: AdminUpdateUserRolesBodyDto,
  ): Promise<AdminUpdateUserRolesResponseDto> {
    await this.updateRolesService.updateUserRoles(
      user.id,
      query.accountId,
      body.roles,
    );
    return {
      success: true,
    };
  }
}
