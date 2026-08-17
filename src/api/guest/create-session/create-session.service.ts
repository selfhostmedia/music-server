import { AuthenticationService } from 'src/authentication/authentication.service';
import { GuestCreateSessionBodyDto } from './create-session.dto';
import { Injectable, Logger } from '@nestjs/common';
import { SessionRestriction } from 'src/types/enums';
import { UserEndSessionController } from 'src/api/user/end-session/end-session.controller';

@Injectable()
export class GuestCreateSessionService {
  private readonly logger: Logger = new Logger(UserEndSessionController.name);

  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Creates a user session used for access APIs requiring authentication
   * @param body
   * @returns
   */
  async post(
    userAgent: string,
    body: GuestCreateSessionBodyDto,
  ): Promise<string> {
    const jwtToken = await this.authenticationService.createSession(
      body.username,
      body.password,
      userAgent,
      SessionRestriction.WEB_UI,
      body.expiresDays,
    );
    return jwtToken;
  }
}
