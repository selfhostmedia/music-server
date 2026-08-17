import * as bcrypt from 'bcryptjs';
import { AccountEntity } from 'src/database/entities';
import { AdminCreateAccountBodyDto } from './create-account.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class AdminCreateAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async post(body: AdminCreateAccountBodyDto): Promise<void> {
    const { username, password, roles } = body;
    if (!roles.length) {
      throw new BadRequestException(ErrorCodes.INVALID_USER_ROLE_ERROR);
    }
    const exists = await this.accountEntity.findOne({
      attributes: ['id'],
      where: {
        username,
      },
    });
    if (exists?.id) {
      throw new BadRequestException(
        ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
      );
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await this.accountEntity.create({
      username,
      passwordHash,
      roles,
      sessionKey: Guid.create(),
    } as AccountEntity);
  }
}
