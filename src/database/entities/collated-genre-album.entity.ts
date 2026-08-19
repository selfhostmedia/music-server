import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { GenreEntity } from './genre.entity';

/**
 * The CollatedGenreAlbumEntity selects data from a view that collates album information
 * for each individual genre associated with the album, from all of its related tables
 * including artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_genre_albums_data',
  underscored: true,
  timestamps: false,
})
export class CollatedGenreAlbumEntity extends Model<CollatedGenreAlbumEntity> {
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

  @Column(DataType.STRING(255))
  declare artist: string;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('artists');
      return rawValue?.split(',').map((artist: string) => artist.trim()) || [];
    },
  })
  declare artists: string[];

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('composers');
      return rawValue?.split(',').map((composer: string) => composer.trim()) || [];
    },
  })
  declare composers: string[];

  @Column({
    type: DataType.INTEGER,
    references: {
      model: GenreEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => GenreEntity)
  declare genreId: number;

  @BelongsTo(() => GenreEntity)
  declare genre: GenreEntity;

  @Column(DataType.STRING(255))
  declare genreName: string;

  @Column({
    type: DataType.TEXT,
    get(): string[] {
      const rawValue = this.getDataValue('genres');
      return rawValue?.split(',').map((genre: string) => genre.trim()) || [];
    },
  })
  declare genres: string[];

  /**
   * The album ID the file belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    primaryKey: true,
  })
  declare id: number;

  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.INTEGER)
  declare year: number;
}
