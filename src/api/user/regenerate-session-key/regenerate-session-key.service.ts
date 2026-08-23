import { AccountEntity } from 'src/database/entities';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRegenerateSessionKeyService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async regenerateSessionKey(accountId: number): Promise<void> {
    await this.accountEntity.update(
      {
        sessionKey: Guid.create(),
      },
      { where: { id: accountId } },
    );
  }
}
