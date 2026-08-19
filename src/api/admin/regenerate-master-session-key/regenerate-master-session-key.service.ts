import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { SystemConfigurationEntity } from 'src/database/entities';

@Injectable()
export class AdminRegenerateMasterSessionKeyService {
  constructor(
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  async regenerate(accountId: number) {
    const currentConfiguration = await this.systemConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    await this.systemConfigurationEntity.create({
      indexerLogSize: currentConfiguration?.indexerLogSize ?? 100_000,
      sessionMasterKey: Guid.create(),
      createdByAccountId: accountId,
    } as SystemConfigurationEntity);
  }
}
