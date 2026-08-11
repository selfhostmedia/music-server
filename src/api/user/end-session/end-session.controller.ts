import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BadRequestResponse,
  InternalServerErrorResponse,
  SuccessResponse,
} from 'src/api/response.dto';
import { Controller, Delete, Logger } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { Session } from 'src/api/session.decorator';
import { SessionEntity } from 'src/database/entities';
import { UserEndSessionService } from './end-session.service';
import { UserRole } from 'src/constants/enums/user-role.enum';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserEndSessionController {
  private readonly logger: Logger = new Logger(UserEndSessionController.name);

  constructor(private readonly endSessionService: UserEndSessionService) {}

  /**
   * Ends a user session and invalidates the associated JWT token. The user must be authenticated
   * and provide a valid JWT token to end the session.
   */
  @Delete('end-session')
  @AllowedRoles([UserRole.USER])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiResponse({
    type: SuccessResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestResponse,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponse,
  })
  async delete(@Session() session: SessionEntity): Promise<SuccessResponse> {
    try {
      const success = await this.endSessionService.delete(session);
      return {
        success,
      };
    } catch (error) {
      this.logger.error(
        'Error ending session:',
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
