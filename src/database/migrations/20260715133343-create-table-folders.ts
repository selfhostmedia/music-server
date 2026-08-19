import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('folders', {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    folder_path: {
      comment: 'The path to the folder relative to the root folder path',
      type: DataTypes.STRING(255),
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    is_root: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    root_path_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'root_paths',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
  await queryInterface.addIndex('folders', ['account_id', 'folder_path'], {
    name: 'idx_folders_account_id_folder_path',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeIndex('folders', 'idx_folders_account_id_folder_path');
  await queryInterface.dropTable('folders');
}
