import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { AdminLogEntryDto } from './list-indexer-logs.dto';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

function logToRow(item, accounts: Record<number, string>, rootPaths: Record<number, string>): AdminLogEntryDto {
  return {
    ...item,
    username: accounts[item.accountId] || '',
    rootPath: rootPaths[item.rootPathId] || '',
  };
}

@Injectable()
export class AdminListIndexerLogsService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @Inject(IndexerService) private readonly indexerService: IndexerService,
  ) {}

  private async getAccounts() {
    const accounts = await this.accountEntity.findAll({
      attributes: ['id', 'username'],
    });
    const accountMap: Record<number, string> = {};
    accounts.forEach((account) => {
      accountMap[account.id] = account.username;
    });
    return accountMap;
  }

  private async getRootPaths() {
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id', 'rootPath'],
    });
    const rootPathMap: Record<number, string> = {};
    rootPaths.forEach((rootPath) => {
      rootPathMap[rootPath.id] = rootPath.rootPath;
    });
    return rootPathMap;
  }

  async list(accountId?: number, rootPathId?: number, search?: string): Promise<AdminLogEntryDto[]> {
    const accounts = await this.getAccounts();
    const rootPaths = await this.getRootPaths();
    const searchNormalized = search?.toLowerCase()?.trim() || '';
    return this.indexerService.logs
      .filter(
        (item) =>
          (!accountId || item.accountId === accountId) &&
          (!rootPathId || item.rootPathId === rootPathId) &&
          (!searchNormalized || item.message.toLowerCase().indexOf(searchNormalized) > -1),
      )
      .map((item) => logToRow(item, accounts, rootPaths))
      .reverse();
  }
}
