import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AdminRegenerateMasterSessionKeyResponseDto } from './regenerate-master-session-key.dto';
import { AdminRegenerateMasterSessionKeyService } from './regenerate-master-session-key.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Post } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRole } from 'src/constants/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminRegenerateMasterSessionKeyController {
  constructor(
    private readonly regenerateMasterSessionKeyService: AdminRegenerateMasterSessionKeyService,
  ) {}

  @Post('regenerate-master-session-key')
  @AllowedRoles([UserRole.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiCreatedResponse({
    type: AdminRegenerateMasterSessionKeyResponseDto,
    description: 'Master session key regenerated successfully',
  })
  async post(
    @User() user: AccountEntity,
  ): Promise<AdminRegenerateMasterSessionKeyResponseDto> {
    await this.regenerateMasterSessionKeyService.regenerate(user.id);
    return {
      success: true,
    };
  }
}
