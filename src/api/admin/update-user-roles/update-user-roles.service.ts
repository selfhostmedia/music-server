import { AccountEntity } from 'src/database/entities';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { UserRole } from 'src/constants/enums';

@Injectable()
export class AdminUpdateUserRolesService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async updateUserRoles(
    accountId: number,
    updateAccountId: number,
    roles: UserRole[],
  ): Promise<void> {
    const account = await this.accountEntity.findByPk(updateAccountId);
    if (!account) {
      throw new NotFoundException(
        ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
        `Account with ID ${updateAccountId} not found`,
      );
    }
    // Prevent an administrator from removing their own admin role if there is no other administrator
    if (accountId === updateAccountId && !roles.includes(UserRole.ADMIN)) {
      const userList = await this.accountEntity.findAll();
      const adminCount = userList.filter(
        (user) => user.roles.indexOf(UserRole.ADMIN) !== -1,
      ).length;
      if (adminCount <= 1) {
        throw new BadRequestException(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
      }
    }
    await this.accountEntity.update(
      { roles },
      { where: { id: updateAccountId } },
    );
  }
}
