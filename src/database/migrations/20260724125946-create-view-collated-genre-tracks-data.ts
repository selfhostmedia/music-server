import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
CREATE VIEW collated_genre_tracks_data AS
SELECT 
	files.id AS file_id,
	files.account_id AS account_id,
	files.file_size,
	files.file_path,
	files.file_type,
	files.bit_rate AS track_bit_rate,
	files.channels AS track_channels,
	files.comment AS track_comment,
	files.disc_number AS track_disc_number,
	files.duration AS track_duration,
	files.frequency AS track_frequency,
	files.rating AS track_rating,
	files.title AS track_title,
	files.track_number,
	files.year AS track_year,
	albums.id AS album_id,
	albums.title AS album_title,
	albums.year AS album_year,
	genres.id AS genre_id,
	genres.name AS genre_name,
	(
		SELECT group_concat(name, ', ') 
		FROM artists 
		INNER JOIN album_artists ON 
			album_artists.album_id=albums.id AND 
			album_artists.artist_id=artists.id
	) AS album_artists,
	( 
		SELECT group_concat(name, ', ') 
		FROM artists 
		INNER JOIN linked_artists ON 
			linked_artists.file_id=files.id AND 
			linked_artists.artist_id=artists.id
	) AS track_artists,
	(
		SELECT group_concat(name, ', ') 
		FROM composers 
		INNER JOIN linked_composers ON 
			linked_composers.file_id=files.id AND 
			linked_composers.composer_id=composers.id
	) AS track_composers,
	(
		SELECT group_concat(name, ', ') 
		FROM genres 
		INNER JOIN linked_genres ON 
			linked_genres.file_id=files.id AND 
			linked_genres.genre_id=genres.id
	) AS track_genres
FROM files 
INNER JOIN albums ON albums.id = files.album_id
INNER JOIN linked_genres ON linked_genres.file_id = files.id
INNER JOIN genres ON genres.id = linked_genres.genre_id
    `,
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
      DROP VIEW IF EXISTS collated_genre_track_data;
    `,
  );
}
