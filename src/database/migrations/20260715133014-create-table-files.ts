import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('files', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    album_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'albums',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    bit_rate: DataTypes.INTEGER,
    channels: DataTypes.INTEGER,
    comment: DataTypes.STRING(255),
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    disc_number: DataTypes.INTEGER,
    duration: DataTypes.FLOAT,
    file_mtime: DataTypes.DATE,
    file_path: {
      comment: 'The path to the file relative to the root folder path',
      type: DataTypes.STRING(255),
    },
    file_size: DataTypes.INTEGER,
    file_type: DataTypes.STRING(50),
    frequency: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    root_path_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'root_paths',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    title: DataTypes.STRING(255),
    track_number: DataTypes.INTEGER,
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    year: DataTypes.INTEGER,
  });
  await queryInterface.addIndex('files', ['album_id'], {
    name: 'idx_files_album_id',
  });
  await queryInterface.addIndex('files', ['account_id'], {
    name: 'idx_files_account_id',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeIndex('files', 'idx_files_album_id');
  await queryInterface.removeIndex('files', 'idx_files_account_id');
  await queryInterface.dropTable('files');
}
