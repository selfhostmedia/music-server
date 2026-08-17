import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('accounts', {
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
    password_hash: DataType.STRING(60),
    roles: DataType.STRING(100),
    session_key: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
    },
    username: DataType.STRING(50),
    updated_at: {
      type: DataType.DATE,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('accounts');
}
