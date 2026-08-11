import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
import {
  GuestCreateAccountBadResponseDto,
  GuestCreateAccountBodyDto,
  GuestCreateAccountResponseDto,
} from './create-account.dto';
import { GuestCreateAccountService } from './create-account.service';
import { InternalServerErrorResponse } from 'src/api/response.dto';

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestCreateAccountController {
  constructor(
    private readonly createAccountService: GuestCreateAccountService,
  ) {}

  /**
   * Creates a user account used for authentication and accessing APIs requiring authentication
   * and returns a user session and JWT token that can be immediately used. The users must submit
   * a valid and unique email address that has not been previously registered and password
   * credentials to create an account.
   */
  @Post('create-account')
  @ApiCreatedResponse({
    type: GuestCreateAccountResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponse,
  })
  @ApiBadRequestResponse({ type: GuestCreateAccountBadResponseDto })
  async post(
    @Headers('user-agent') userAgent: string,
    @Body() body: GuestCreateAccountBodyDto,
  ): Promise<GuestCreateAccountResponseDto> {
    const data = await this.createAccountService.post(userAgent, body);
    return {
      success: true,
      ...data,
    };
  }
}
