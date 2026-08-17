import { AllowGuest } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
import {
  GuestCreateSessionBadRequestResponseDto,
  GuestCreateSessionBodyDto,
  GuestCreateSessionResponseDto,
} from './create-session.dto';
import { GuestCreateSessionService } from './create-session.service';
import { InternalServerErrorResponse } from 'src/api/response.dto';

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestCreateSessionController {
  constructor(
    private readonly createSessionService: GuestCreateSessionService,
  ) {}

  /**
   * Creates a user session and returns a JWT token used for authenticating and accessing APIs requiring
   * authentication. The session can be configured to expire after a number of days, or never expire. The
   * users must submit valid credentials including an email address and password to create a session and
   * their account must be in good standing to create a session.
   */
  @Post('create-session')
  @AllowGuest()
  @ApiCreatedResponse({
    type: GuestCreateSessionResponseDto,
  })
  @ApiBadRequestResponse({
    type: GuestCreateSessionBadRequestResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponse,
  })
  @ApiBadRequestResponse({ type: GuestCreateSessionBadRequestResponseDto })
  async post(
    @Req() req: Request,
    @Body() body: GuestCreateSessionBodyDto,
  ): Promise<GuestCreateSessionResponseDto> {
    const userAgent = req.headers['user-agent'] || '';
    const jwtToken = await this.createSessionService.post(userAgent, body);
    return {
      success: true,
      jwtToken,
    };
  }
}
