import { AccountEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class AdminResetUserPasswordService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async resetUserPassword(
    accountId: number,
    newPassword: string,
  ): Promise<void> {
    const account = await this.accountEntity.findByPk(accountId);
    if (!account) {
      throw new NotFoundException(
        ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
        `Account with ID ${accountId} not found`,
      );
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.accountEntity.update(
      { passwordHash },
      { where: { id: accountId } },
    );
  }
}
