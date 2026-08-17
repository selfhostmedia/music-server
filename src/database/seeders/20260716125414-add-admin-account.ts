import { Guid } from 'typescript-guid';
import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';

export async function up(queryInterface: QueryInterface) {
  const username = process.env.DEFAULT_USERNAME || 'admin';
  const password = process.env.DEFAULT_PASSWORD || 'admin';
  const passwordHash = await bcrypt.hash(password, 10);
  const sessionKey = Guid.create().toString();
  await queryInterface.sequelize.query(
    `INSERT INTO accounts(username, password_hash, roles, session_key) VALUES ('${username}', '${passwordHash}', 'admin,user', '${sessionKey}');`,
  );
}

export async function down(queryInterface: QueryInterface) {
  const username = process.env.DEFAULT_USERNAME || 'admin';
  await queryInterface.sequelize.query(
    `DELETE FROM accounts WHERE username = '${username}';`,
  );
}
