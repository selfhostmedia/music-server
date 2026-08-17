import { AdminListAccountsResponseDto } from './list-accounts.dto';
import { AdminListAccountsService } from './list-accounts.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { JWT_TOKEN } from 'src/constants/swagger';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
export class AdminListAccountsController {
  constructor(private readonly listAccountsService: AdminListAccountsService) {}

  @Get('list-accounts')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Accounts listed successfully',
    type: AdminListAccountsResponseDto,
  })
  async get(): Promise<AdminListAccountsResponseDto> {
    const accounts = await this.listAccountsService.listAccounts();
    return { accounts, success: true };
  }
}
