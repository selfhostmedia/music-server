/* eslint-disable max-classes-per-file */
import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { ComposerEntity } from './composer.entity';

/**
 * The CollatedComposerAlbumEntity selects data from a view that collates album information
 * for each individual composer associated with the album, from all of its related tables
 * including artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_composer_albums_data',
  underscored: true,
  timestamps: false,
})
export class CollatedComposerAlbumEntity extends Model<CollatedComposerAlbumEntity> {
  /**
   * The account ID the root path belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    allowNull: true,
  })
  @ForeignKey(() => AccountEntity)
  declare accountId: number;

  @BelongsTo(() => AccountEntity)
  declare account: AccountEntity;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('artists');
      return rawValue?.split(',').map((artist: string) => artist.trim()) || [];
    },
  })
  declare artists: string[];

  @Column({
    type: DataType.INTEGER,
    references: {
      model: ComposerEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => ComposerEntity)
  declare composerId: number;

  @BelongsTo(() => ComposerEntity)
  declare composer: ComposerEntity;

  @Column(DataType.STRING(255))
  declare composerName: string;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('composers');
      return rawValue?.split(',').map((composer: string) => composer.trim()) || [];
    },
  })
  declare composers: string[];

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('genres');
      return rawValue?.split(',').map((genre: string) => genre.trim()) || [];
    },
  })
  declare genres: string[];

  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.INTEGER)
  declare year: number;
}
