import { AccountEntity } from 'src/database/entities';
import { AuthenticatedRequest } from 'src/types';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AccountEntity => {
    const request = ctx.switchToHttp().getRequest() as AuthenticatedRequest;
    return request.user as AccountEntity;
  },
);
