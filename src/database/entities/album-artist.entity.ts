import { AlbumEntity } from './album.entity';
import { ArtistEntity } from './artist.entity';
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';

/**
 * The AlbumArtistEntity holds a reference to the association between an album artist and meta data.
 */
@Table({
  tableName: 'album_artists',
  timestamps: true,
  underscored: true,
})
export class AlbumArtistEntity extends Model<AlbumArtistEntity> {
  /**
   * The linked album ID
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AlbumEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AlbumEntity)
  declare albumId: number;

  @BelongsTo(() => AlbumEntity)
  declare album?: AlbumEntity;

  /**
   * The linked artist ID
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: ArtistEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => ArtistEntity)
  declare artistId: number;

  /**
   * The linked artist
   */
  @BelongsTo(() => ArtistEntity)
  declare artist?: ArtistEntity;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be specified if you are
   * inserting and updating data
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field should not be specified if you are inserting and updating data
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
