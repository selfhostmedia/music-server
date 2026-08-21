import { IndexerConfigurationEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminSetIndexerStatusService {
  constructor(
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationEntity: typeof IndexerConfigurationEntity,
  ) {}

  async setScannerStatus(accountId: number, enabled: boolean) {
    return this.indexerConfigurationEntity.create({
      isEnabled: enabled,
      createdByAccountId: accountId,
    } as IndexerConfigurationEntity);
  }
}
