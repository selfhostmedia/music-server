import {
  FileEntity,
  GenreEntity,
  LinkedGenreEntity,
} from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  SynologyDefaultGenreDataDto,
  SynologyGenreDataDto,
  SynologyGenreDto,
} from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function genreToRow(genre: GenreEntity): SynologyGenreDto {
  return {
    additional: {
      artist_rating: {
        rating: 0,
      },
    },
    id: `genre_${genre.id}`,
    name: replaceDoubleQuotes(genre.name),
  };
}

@Injectable()
export class SynologyGenreService {
  constructor(
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
  ) {}

  async listDefaultGenres(
    accountId: number,
  ): Promise<SynologyDefaultGenreDataDto> {
    const genres = await this.genreEntity.findAll({
      where: {
        accountId,
        isDefault: true,
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    return {
      default_genres: genres.map((genre) => ({ name: genre.name })),
      total: genres.length,
    };
  }

  async listGenres(
    accountId: number,
    offset: number,
    limit: number,
  ): Promise<SynologyGenreDataDto> {
    const genres = await this.genreEntity.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: LinkedGenreEntity,
          attributes: ['fileId'],
          include: [
            {
              model: FileEntity,
              attributes: ['id'],
              where: {
                accountId,
              },
            },
          ],
        },
      ],
      group: ['GenreEntity.id'],
      order: [['name', 'ASC']],
      offset,
      limit: limit || 100000,
    });
    const total = await this.genreEntity.count({
      attributes: [
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn('DISTINCT', Sequelize.col('name')),
          ),
          'count',
        ],
      ],
      include: [
        {
          model: LinkedGenreEntity,
          attributes: ['fileId'],
          include: [
            {
              model: FileEntity,
              attributes: ['id'],
              where: {
                accountId,
              },
              required: true,
            },
          ],
          required: true,
        },
      ],
    });
    return {
      genres: genres.map(genreToRow),
      offset,
      total,
    };
  }
}
