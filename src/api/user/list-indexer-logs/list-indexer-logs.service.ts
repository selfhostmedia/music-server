import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RootPathEntity } from 'src/database/entities';
import { UserLogEntryDto } from './list-indexer-logs.dto';

function logToRow(item, accounts: Record<number, string>, rootPaths: Record<number, string>): UserLogEntryDto {
  return {
    ...item,
    accountId: undefined,
    rootPath: rootPaths[item.rootPathId] || '',
  };
}

@Injectable()
export class UserListIndexerLogsService {
  constructor(
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @Inject(IndexerService) private readonly indexerService: IndexerService,
  ) {}

  private async getRootPaths(accountId: number) {
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id', 'rootPath'],
      where: {
        accountId,
      },
    });
    const rootPathMap: Record<number, string> = {};
    rootPaths.forEach((rootPath) => {
      rootPathMap[rootPath.id] = rootPath.rootPath;
    });
    return rootPathMap;
  }

  async list(accountId: number, rootPathId?: number, search?: string): Promise<UserLogEntryDto[]> {
    const rootPaths = await this.getRootPaths(accountId);
    if (rootPathId && !rootPaths[rootPathId]) {
      throw new NotFoundException(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR);
    }
    const searchNormalized = search?.toLowerCase()?.trim() || '';
    return this.indexerService.logs
      .filter(
        (item) =>
          item.accountId === accountId &&
          (!rootPathId || item.rootPathId === rootPathId) &&
          (!searchNormalized || item.message.toLowerCase().indexOf(searchNormalized) > -1),
      )
      .map((item) => logToRow(item, {}, rootPaths))
      .reverse();
  }
}
