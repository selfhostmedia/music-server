import { CollatedTrackEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  SynologyComposerDataDto,
  SynologyComposerDto,
} from './dtos/composer.cgi.dto';
import { replaceDoubleQuotes } from 'src/utils/strings';

function personToRow(person: CollatedTrackEntity): SynologyComposerDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `composer_${person.id}`,
    name: replaceDoubleQuotes(person.trackComposers.join(', ')),
  };
}

@Injectable()
export class SynologyComposerService {
  constructor(
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
  ) {}

  async listComposers(
    accountId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyComposerDataDto> {
    const composers = await this.collatedTrackEntity.findAll({
      attributes: [
        [
          Sequelize.fn('DISTINCT', Sequelize.col('track_composers')),
          'trackComposers',
        ],
      ],
      where: {
        accountId,
      },
      order: [['track_composers', 'ASC']],
      limit,
      offset,
    });
    const total = await this.collatedTrackEntity.count({
      attributes: [
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('track_composers')),
          ),
          'count',
        ],
      ],
      where: {
        accountId,
      },
    });
    return {
      composers: composers.map(personToRow),
      offset,
      total,
    };
  }
}
