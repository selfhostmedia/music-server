import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('genres', {
    account_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    is_default: DataType.BOOLEAN,
    name: DataType.STRING(255),
    name_normalized: DataType.STRING(255),
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('genres', ['name'], {
    name: 'idx_genres_name',
  });
  await queryInterface.addIndex('genres', ['name_normalized'], {
    name: 'idx_genres_name_normalized',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('genres', 'idx_genres_name');
  await queryInterface.removeIndex('genres', 'idx_genres_name_normalized');
  await queryInterface.dropTable('genres');
}
