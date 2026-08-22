import { QueryInterface } from 'sequelize';

const adminRootPaths = process.env.DEFAULT_ADMIN_ROOT_PATH?.split(',');
const defaultUserRootPaths = process.env.DEFAULT_USER_ROOT_PATH?.split(',');

export async function up(queryInterface: QueryInterface) {
  if (adminRootPaths?.length) {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminAccount = await queryInterface.rawSelect(
      'accounts',
      {
        where: { username },
      },
      ['id'],
    );
    await queryInterface.bulkInsert(
      'root_paths',
      adminRootPaths.map((path) => ({
        account_id: adminAccount,
        root_path: path,
      })),
    );
  }
  if (defaultUserRootPaths?.length && !process.env.DISABLE_DEFAULT_USER) {
    const username = process.env.DEFAULT_USER_USERNAME || 'user';
    const userAccount = await queryInterface.rawSelect(
      'accounts',
      {
        where: { username },
      },
      ['id'],
    );
    if (!userAccount) {
      throw new Error('Default account not found');
    }
    await queryInterface.bulkInsert(
      'root_paths',
      defaultUserRootPaths.map((path) => ({
        account_id: userAccount,
        root_path: path,
      })),
    );
  }
}

export async function down(queryInterface: QueryInterface) {
  const userAccounts = await queryInterface.rawSelect(
    'accounts',
    {
      where: {
        username: [process.env.DEFAULT_ADMIN_USERNAME || 'admin', process.env.DEFAULT_USER_USERNAME || 'user'],
      },
    },
    ['id'],
  );
  await queryInterface.bulkDelete('root_paths', {
    root_path: adminRootPaths?.concat(defaultUserRootPaths || []),
    account_id: userAccounts,
  });
}
