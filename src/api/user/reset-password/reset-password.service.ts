import { AccountEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserResetPasswordService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async resetUserPassword(accountId: number, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.accountEntity.update({ passwordHash }, { where: { id: accountId } });
  }
}
