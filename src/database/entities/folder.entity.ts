import { AccountEntity } from './account.entity';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

/**
 * The FolderEntity is a view that contains all unique folder paths for a given account and root path.  It is
 * used for browsing music by folders.
 */
@Table({
  tableName: 'folders',
  timestamps: false,
  underscored: true,
})
export class FolderEntity extends Model<FolderEntity> {
  /**
   * The account ID the file belongs to
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
  declare accountId?: number;

  /**
   * The file path for the music file relative to the root path
   */
  @Column({
    type: DataType.STRING(255),
  })
  declare folderPath: string;

  /**
   * The ID of the table row is the first file ID that was found in the folder path
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  @Column(DataType.BOOLEAN)
  declare isRoot: boolean;

  @Column({
    type: DataType.INTEGER,
    references: {
      model: 'root_paths',
      key: 'id',
    },
  })
  declare rootPathId: number;
}
