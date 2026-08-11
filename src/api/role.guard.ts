import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  Inject,
  Injectable,
  Logger,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from 'src/constants/enums';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

export const AllowedRoles = (roles: UserRole[]) => SetMetadata('roles', roles);

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RoleGuard.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
    @Inject(Reflector) private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.configService.get('REQUIRE_AUTH')) {
      // authentication is not required for this environment
      return true;
    }
    const request = context.switchToHttp().getRequest();
    // verify the session if a JWT token is present in authorization header
    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload: {
          accountId: number;
          sessionId: number;
          tokenHash: string;
        } = await this.jwtService.verifyAsync(token);
        if (payload) {
          const user = await this.authenticationService.getAccount(
            payload.accountId,
          );
          if (!user) {
            throw new UnauthorizedException(
              ErrorCodes.AUTHORIZATION_ERROR,
              'session-error-1',
            );
          }
          const session = await this.authenticationService.getSession(
            payload.sessionId,
          );
          if (
            !session ||
            session.expiresAt.getTime() < new Date().getTime() ||
            session.endedAt !== null
          ) {
            throw new UnauthorizedException(
              ErrorCodes.AUTHORIZATION_ERROR,
              'session-error-2',
            );
          }
          if (
            !this.authenticationService.verifySessionToken(
              user,
              session,
              payload.tokenHash,
            )
          ) {
            throw new UnauthorizedException(
              ErrorCodes.AUTHORIZATION_ERROR,
              'session-error-3',
            );
          }
          request.user = user;
          request.session = session;
        }
      } catch (error) {
        this.logger.error(
          'Error verifying JWT token:',
          error instanceof Error ? error.message : error,
        );
        throw new UnauthorizedException(
          ErrorCodes.AUTHORIZATION_ERROR,
          'session-error-4',
        );
      }
    }
    // check for role eligibility
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles?.length) {
      // no roles are required for public route
      return true;
    }
    const user = request.user as AccountEntity;
    if (!user) {
      // role is required but user is not signed in
      return false;
    }
    if (requiredRoles.some((role) => user.role.includes(role))) {
      // user satisfies role requirement
      return true;
    }
    throw new UnauthorizedException(
      ErrorCodes.AUTHORIZATION_ERROR,
      'session-error-5',
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
