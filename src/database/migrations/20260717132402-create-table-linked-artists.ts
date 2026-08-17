import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('linked_artists', {
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    artist_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'artists',
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
  await queryInterface.addIndex('linked_artists', ['artist_id'], {
    name: 'idx_linked_artists_artist_id',
  });
  await queryInterface.addIndex('linked_artists', ['file_id'], {
    name: 'idx_linked_artists_file_id',
  });
  await queryInterface.addIndex('linked_artists', ['artist_id', 'file_id'], {
    name: 'idx_linked_artists_artist_id_file_id',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex(
    'linked_artists',
    'idx_linked_artists_artist_id',
  );
  await queryInterface.removeIndex(
    'linked_artists',
    'idx_linked_artists_file_id',
  );
  await queryInterface.removeIndex(
    'linked_artists',
    'idx_linked_artists_artist_id_file_id',
  );
  await queryInterface.dropTable('linked_artists');
}
