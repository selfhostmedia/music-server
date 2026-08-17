import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import {
  AdminDeleteAccountBadRequestResponseDto,
  AdminDeleteAccountNotFoundResponseDto,
  AdminDeleteAccountQueryDto,
  AdminDeleteAccountResponseDto,
} from './delete-account.dto';
import { AdminDeleteAccountService } from './delete-account.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Delete, Query } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: 'api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminDeleteAccountController {
  constructor(
    private readonly deleteAccountService: AdminDeleteAccountService,
  ) {}

  // eslint-disable-next-line class-methods-use-this
  @Delete('delete-account')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminDeleteAccountResponseDto,
    description: 'Account deleted successfully',
  })
  @ApiNotFoundResponse({
    type: AdminDeleteAccountNotFoundResponseDto,
    description: 'Account not found',
  })
  @ApiBadRequestResponse({
    type: AdminDeleteAccountBadRequestResponseDto,
    description: 'Invalid account ID or account does not exist',
  })
  async delete(
    @User() user: AccountEntity,
    @Query() query: AdminDeleteAccountQueryDto,
  ): Promise<AdminDeleteAccountResponseDto> {
    await this.deleteAccountService.deleteAccount(user.id, query.accountId);
    return {
      success: true,
    };
  }
}
