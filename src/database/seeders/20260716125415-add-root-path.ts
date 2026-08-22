import { QueryInterface } from 'sequelize';

const rootPaths = process.env.DEFAULT_ROOT_PATH?.split(',');

export async function up(queryInterface: QueryInterface) {
  if (!rootPaths || rootPaths.length === 0) {
    return;
  }
  await queryInterface.bulkInsert(
    'root_paths',
    rootPaths.map((path) => ({
      account_id: 1,
      root_path: path,
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('root_paths', {
    root_path: rootPaths,
  });
}
