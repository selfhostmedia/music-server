import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SessionEntity } from 'src/database/entities';

@Injectable()
export class UserEndSessionService {
  // eslint-disable-next-line class-methods-use-this
  async delete(session: SessionEntity): Promise<true> {
    const result = await session.update(
      { endedAt: new Date() },
      {
        where: {
          id: session.id,
        },
      },
    );
    if (result.endedAt) {
      return true;
    }
    throw new InternalServerErrorException(ErrorCodes.INTERNAL_SERVER_ERROR);
  }
}
