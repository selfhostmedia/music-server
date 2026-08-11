import { AccountEntity, SessionEntity } from 'src/database/entities';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user?: AccountEntity;
  session?: SessionEntity;
};
