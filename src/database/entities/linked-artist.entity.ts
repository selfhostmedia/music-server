import { ArtistEntity } from './artist.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { FileEntity } from './file.entity';

/**
 * The LinkedArtistEntity holds a reference to the association between an artist and meta data.
 */
@Table({
  tableName: 'linked_artists',
  timestamps: true,
  underscored: true,
})
export class LinkedArtistEntity extends Model<LinkedArtistEntity> {
  /**
   * The linked artist.
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
   * The linked artist.
   */
  @BelongsTo(() => ArtistEntity)
  declare artist?: ArtistEntity;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  /**
   * The linked file ID.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: FileEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => FileEntity)
  declare fileId: number;

  /**
   * The linked file.
   */
  @BelongsTo(() => FileEntity)
  declare file?: FileEntity;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
