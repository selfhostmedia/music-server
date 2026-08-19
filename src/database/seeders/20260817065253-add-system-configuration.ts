import { Guid } from 'typescript-guid';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  const data = await queryInterface.sequelize.query(`SELECT id FROM accounts WHERE roles LIKE '%admin%' LIMIT 1;`);
  const accounts = data[0] as { id: number }[];
  const adminId = accounts?.[0]?.id;
  if (!adminId) {
    throw new Error('No admin account found. Please run the add-admin-account seeder first.');
  }
  const existing = await queryInterface.sequelize.query(`SELECT * FROM system_configurations LIMIT 1;`);
  const existingConfigs = existing[0];
  if (existingConfigs.length === 0) {
    await queryInterface.insert(null, 'system_configurations', {
      created_by_account_id: adminId,
      indexer_log_size: 100_000,
      session_master_key: Guid.create().toString(),
    });
  }
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.delete(null, 'system_configurations', {});
}
