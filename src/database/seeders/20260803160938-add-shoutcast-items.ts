import { QueryInterface } from 'sequelize';

// Using a hard-coded genre list even though genres can be requested live from the
// SHOUTcast API an API key is required for retrieving them and it's not clear if
// this data ever changes.
const genres = [
  'Alternative',
  'Blues',
  'Classical',
  'Country',
  'Easy Listening',
  'Electronic',
  'Folk',
  'Themes',
  'Rap',
  'Inspirational',
  'International',
  'Jazz',
  'Latin',
  'Metal',
  'New Age',
  'Decades',
  'Pop',
  'R&B and Urban',
  'Reggae',
  'Rock',
  'Seasonal and Holiday',
  'Soundtracks',
  'Talk',
  'Misc',
  'Public Radio',
];

export async function up(queryInterface: QueryInterface) {
  await queryInterface.bulkInsert(
    'shoutcast_items',
    genres.map((title) => ({
      title,
      container_id: 1,
      type: 'container',
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('shoutcast_items', {
    title: genres,
  });
}
