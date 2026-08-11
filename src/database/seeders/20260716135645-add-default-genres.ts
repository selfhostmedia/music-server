import { QueryInterface } from 'sequelize';
import { normalizeString } from '../../utils/strings';

const defaultGenres = [
  'Classical',
  'Pop',
  'Blues/Soul',
  'Ballad',
  'Soundtrack',
  'Country',
  'Rock/Metal',
  'Jazz',
  'Hip-Hop/R&B',
  'Funk',
  'EDM/Dance',
  'Reggae',
  'World/Spiritual',
];

export async function up(queryInterface: QueryInterface) {
  await queryInterface.bulkInsert(
    'genres',
    defaultGenres.map((name) => ({
      account_id: 1,
      name,
      name_normalized: normalizeString(name),
      is_default: true,
    })),
  );
  const nonDefaultGenres = defaultGenres
    .filter((name) => name.includes('/'))
    .join('/')
    .split('/');
  await queryInterface.bulkInsert(
    'genres',
    nonDefaultGenres.map((name) => ({
      account_id: 1,
      name,
      name_normalized: normalizeString(name),
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('genres', {
    is_default: true,
  });
}
