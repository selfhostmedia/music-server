import { AccountEntity } from 'src/database/entities';
import { AdminAccountDto } from './list-accounts.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

function userToRow(user: AccountEntity): AdminAccountDto {
  return {
    id: user.id,
    username: user.username,
    roles: user.roles,
  };
}

@Injectable()
export class AdminListAccountsService {
  constructor(
    @InjectModel(AccountEntity)
    private accountEntity: typeof AccountEntity,
  ) {}

  async listAccounts(): Promise<AdminAccountDto[]> {
    const accounts = await this.accountEntity.findAll({
      attributes: ['id', 'username', 'roles'],
    });
    return accounts.map(userToRow);
  }
}
