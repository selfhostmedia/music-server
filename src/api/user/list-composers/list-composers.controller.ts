import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListComposersBadRequestResponseDto,
  UserListComposersQueryDto,
  UserListComposersResponseDto,
} from './list-composers.dto';
import { UserListComposersService } from './list-composers.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserListComposersController {
  constructor(private readonly listComposersService: UserListComposersService) {}

  @Get('list-composers')
  @ApiOperation({
    summary: 'List composers',
    description: `Retrieves a list of composers for the user based on the provided query parameters.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the list of composers for the user.',
    type: UserListComposersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request was invalid or missing required parameters.',
    type: UserListComposersBadRequestResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListComposersQueryDto,
  ): Promise<UserListComposersResponseDto> {
    const data = await this.listComposersService.listComposers(user.id, query);
    return {
      success: true,
      ...data,
    };
  }
}
