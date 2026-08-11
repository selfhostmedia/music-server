import { AuthenticatedRequest } from 'src/types';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { SessionEntity } from 'src/database/entities';

export const Session = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SessionEntity => {
    const request = ctx.switchToHttp().getRequest() as AuthenticatedRequest;
    return request.session as SessionEntity;
  },
);
