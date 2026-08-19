import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('linked_composers', {
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    composer_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'composers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    file_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'files',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('linked_composers', ['composer_id'], {
    name: 'idx_linked_composers_composer_id',
  });
  await queryInterface.addIndex('linked_composers', ['file_id'], {
    name: 'idx_linked_composers_file_id',
  });
  await queryInterface.addIndex('linked_composers', ['composer_id', 'file_id'], {
    name: 'idx_linked_composers_composer_id_file_id',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('linked_composers', 'idx_linked_composers_composer_id');
  await queryInterface.removeIndex('linked_composers', 'idx_linked_composers_file_id');
  await queryInterface.removeIndex('linked_composers', 'idx_linked_composers_composer_id_file_id');
  await queryInterface.dropTable('linked_composers');
}
