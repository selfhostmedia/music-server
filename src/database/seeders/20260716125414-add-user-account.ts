import { Guid } from 'typescript-guid';
import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';

const username = process.env.DEFAULT_USER_USERNAME || 'user';
const password = process.env.DEFAULT_USER_PASSWORD || 'user';

export async function up(queryInterface: QueryInterface) {
  if (!process.env.DISABLE_DEFAULT_USER) {
    const passwordHash = await bcrypt.hash(password, 10);
    const sessionKey = Guid.create().toString();
    await queryInterface.sequelize.query(
      `INSERT INTO accounts(username, password_hash, roles, session_key) 
      VALUES ('${username}', '${passwordHash}', 'user', '${sessionKey}');`,
    );
  }
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`DELETE FROM accounts WHERE username = '${username}';`);
}
