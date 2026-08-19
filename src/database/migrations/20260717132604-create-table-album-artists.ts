import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('album_artists', {
    album_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'albums',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('album_artists', ['album_id'], {
    name: 'idx_album_artists_album_id',
  });
  await queryInterface.addIndex('album_artists', ['artist_id'], {
    name: 'idx_album_artists_artist_id',
  });
  await queryInterface.addIndex('album_artists', ['album_id', 'artist_id'], {
    name: 'idx_album_artists_album_id_artist_id',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('album_artists', 'idx_album_artists_album_id');
  await queryInterface.removeIndex('album_artists', 'idx_album_artists_artist_id');
  await queryInterface.removeIndex('album_artists', 'idx_album_artists_album_id_artist_id');
  await queryInterface.dropTable('album_artists');
}
