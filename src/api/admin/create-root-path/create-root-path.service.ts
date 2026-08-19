import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { existsSync } from 'node:fs';

@Injectable()
export class AdminCreateRootPathService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async createRootPath(accountId: number, rootPath: string): Promise<RootPathEntity> {
    const account = await this.accountEntity.findByPk(accountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    if (!existsSync(rootPath)) {
      throw new BadRequestException(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    }
    const existingRootPath = await this.rootPathEntity.findOne({
      where: { rootPath, accountId },
    });
    if (existingRootPath) {
      throw new BadRequestException(ErrorCodes.DUPLICATE_ROOT_PATH_ERROR);
    }
    const newRootPath = await this.rootPathEntity.create({
      rootPath,
      accountId,
    } as RootPathEntity);
    return newRootPath;
  }
}
