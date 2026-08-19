import { AccountEntity, IndexerConfigurationEntity } from 'src/database/entities';
import { AdminIndexerConfigurationDto } from './indexer-configuration.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

function configurationToRow(config: IndexerConfigurationEntity): AdminIndexerConfigurationDto {
  return {
    id: config.id,
    isEnabled: config.isEnabled,
    createdAt: config.createdAt,
    createdByAccountId: config.createdByAccountId,
    createdByUsername: config.createdByAccount?.username || 'Unknown',
  };
}

@Injectable()
export class AdminIndexerConfigurationService {
  constructor(
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationModel: typeof IndexerConfigurationEntity,
  ) {}

  async getIndexerConfiguration(): Promise<AdminIndexerConfigurationDto> {
    // load the latest configuration
    const configuration = await this.indexerConfigurationModel.findOne({
      attributes: ['id', 'isEnabled', 'createdAt', 'createdByAccountId'],
      include: [
        {
          model: AccountEntity,
          attributes: ['username'],
          as: 'createdByAccount',
        },
      ],
      order: [['id', 'DESC']],
    });
    if (!configuration) {
      throw new InternalServerErrorException(ErrorCodes.INDEXER_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return configurationToRow(configuration);
  }
}
