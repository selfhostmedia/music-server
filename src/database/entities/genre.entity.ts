import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { LinkedGenreEntity } from './linked-genre.entity';

/**
 * The GenreEntity holds all of the information required for a genre
 */
@Table({
  tableName: 'genres',
  timestamps: true,
  underscored: true,
})
export class GenreEntity extends Model<GenreEntity> {
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
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AccountEntity)
  declare accountId: number;

  @BelongsTo(() => AccountEntity)
  declare account: AccountEntity;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @HasMany(() => LinkedGenreEntity)
  declare linkedGenres?: LinkedGenreEntity[];

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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    get() {
      const value = this.getDataValue('isDefault');
      return value === 1 || value === true;
    },
  })
  declare isDefault: boolean;

  /**
   * The name of the genre
   */
  @Column(DataType.STRING(255))
  declare name: string;

  /**
   * The normalized name of the genre
   */
  @Column(DataType.STRING(255))
  declare nameNormalized: string;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
