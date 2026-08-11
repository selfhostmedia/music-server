import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('linked_genres', {
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    genre_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'genres',
        key: 'id',
      },
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
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('linked_genres', ['genre_id'], {
    name: 'idx_linked_genres_genre_id',
  });
  await queryInterface.addIndex('linked_genres', ['file_id'], {
    name: 'idx_linked_genres_file_id',
  });
  await queryInterface.addIndex('linked_genres', ['genre_id', 'file_id'], {
    name: 'idx_linked_genres_genre_id_file_id',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex(
    'linked_genres',
    'idx_linked_genres_genre_id',
  );
  await queryInterface.removeIndex(
    'linked_genres',
    'idx_linked_genres_file_id',
  );
  await queryInterface.removeIndex(
    'linked_genres',
    'idx_linked_genres_genre_id_file_id',
  );
  await queryInterface.dropTable('linked_genres');
}
