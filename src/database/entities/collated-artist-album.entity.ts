import { AccountEntity } from './account.entity';
import { ArtistEntity } from './artist.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

/**
 * The CollatedArtistAlbumEntity selects data from a view that collates album information
 * for each individual artist associated with the album, from all of its related tables
 * including artists, composers and genres.
 *
 * Note:  because this is a view and not a table write operations cannot be performed.
 */
@Table({
  tableName: 'collated_artist_albums_data',
  underscored: true,
  timestamps: false,
})
export class CollatedArtistAlbumEntity extends Model<CollatedArtistAlbumEntity> {
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
    type: DataType.INTEGER,
    references: {
      model: ArtistEntity,
      key: 'id',
    },
  })
  @ForeignKey(() => ArtistEntity)
  declare artistId: number;

  @BelongsTo(() => ArtistEntity)
  declare artist: ArtistEntity;

  @Column(DataType.STRING(255))
  declare artistName: string;

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
