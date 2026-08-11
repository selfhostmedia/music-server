import { QueryInterface } from 'sequelize';

const containers = ['SHOUTcast', 'User defined', 'My favorite'];

export async function up(queryInterface: QueryInterface) {
  await queryInterface.bulkInsert(
    'shoutcast_containers',
    containers.map((title) => ({
      account_id: 1,
      title,
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('shoutcast_containers', {
    account_id: 1,
    title: containers,
  });
}
