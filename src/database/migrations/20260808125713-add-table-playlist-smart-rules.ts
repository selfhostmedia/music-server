import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('playlist_smart_rules', {
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    field: DataTypes.STRING(50),
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    interval: DataTypes.STRING(50),
    operation: DataTypes.STRING(50),
    playlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'playlists',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    value: DataTypes.STRING(255),
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('playlist_smart_rules');
}
