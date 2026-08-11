import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
CREATE VIEW collated_genre_albums_data AS
SELECT 
	albums.id,
	albums.title,
	albums.year,
	albums.account_id,
	genres.id as genre_id,
	genres.name as genre_name,
	(
		SELECT name 
		FROM artists 
		INNER JOIN album_artists ON 
				album_artists.album_id=albums.id AND 
				album_artists.artist_id=artists.id 
		ORDER BY album_artists.id desc limit 1
	) AS artist,
	(
		SELECT group_concat(unique_artists.name, ', ') 
		FROM (
			SELECT DISTINCT(name)  as name
			FROM artists 
			INNER JOIN album_artists ON album_artists.album_id=albums.id AND album_artists.artist_id=artists.id
  		) as unique_artists
	) AS artists,
	(
		SELECT group_concat(unique_composers.name, ', ') 
    	FROM 
		(
			SELECT DISTINCT(name) as name
			FROM composers 
			INNER JOIN linked_composers ON linked_composers.composer_id = composers.id
			INNER JOIN files on files.id = linked_composers.file_id AND files.album_id = albums.id
		) as unique_composers
	) AS composers,
	(
		SELECT group_concat(unique_genres.name, ', ') 
    	FROM (
			SELECT DISTINCT(name) as name
			FROM genres 
			INNER JOIN linked_genres ON linked_genres.genre_id = genres.id
			INNER JOIN files on files.id = linked_genres.file_id AND files.album_id = albums.id
  		) as unique_genres
	) AS genres
FROM albums
INNER JOIN files ON files.album_id = albums.id
INNER JOIN linked_genres ON linked_genres.file_id = files.id
INNER JOIN genres ON genres.id = linked_genres.genre_id
    `,
  );
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(
    `
      DROP VIEW IF EXISTS collated_genre_albums_data;
    `,
  );
}
