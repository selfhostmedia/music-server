import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie } from '../../test-helper';
import { listSongs } from '../../test-helper.synology';

describe('/webapi/AudioStation/song.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list album songs', async () => {
    const data = await listSongs({
      album: 'Album 5',
      album_artist: 'Artist 3',
    });
    expect(data?.data.total).toBe(4);
    expect(data?.data.songs.length).toBe(4);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[3]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate album songs', async () => {
    const filter = { album: 'Album 5', album_artist: 'Artist 3' };
    // page 1
    const data = await listSongs(filter, 0, 2);
    expect(data?.data.total).toBe(4);
    expect(data?.data.songs.length).toBe(2);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
    // page 2
    const data2 = await listSongs(filter, 2, 2);
    expect(data2?.data.total).toBe(4);
    expect(data2?.data.songs.length).toBe(2);
    expect(data2?.data.songs[0]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data2?.data.songs[1]?.title).toBe('04 Fourth Track');
    expect(data2?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list composer songs', async () => {
    const data = await listSongs({
      composer: 'Composer 4',
    });
    expect(data?.data.total).toBe(5);
    expect(data?.data.songs.length).toBe(5);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[3]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should paginate composer songs', async () => {
    const filter = { composer: 'Composer 4' };
    // page 1
    const data = await listSongs(filter, 0, 2);
    expect(data?.data.total).toBe(5);
    expect(data?.data.songs.length).toBe(2);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 3');
    // page 2
    const data2 = await listSongs(filter, 2, 2);
    expect(data2?.data.total).toBe(5);
    expect(data2?.data.songs.length).toBe(2);
    expect(data2?.data.songs[0]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[1]?.title).toBe('05 Fifth Track');
    expect(data2?.data.songs[1]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data2?.data.songs[1]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should list composer album songs', async () => {
    const data = await listSongs({
      album: 'Album 3',
      album_artist: 'Artist 2',
      composer: 'Composer 4',
    });
    expect(data?.data.total).toBe(3);
    expect(data?.data.songs.length).toBe(3);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should paginate composer album songs', async () => {
    const filter = {
      album: 'Album 3',
      album_artist: 'Artist 2',
      composer: 'Composer 4',
    };
    // page 1
    const data = await listSongs(filter, 0, 1);
    expect(data?.data.total).toBe(3);
    expect(data?.data.songs.length).toBe(1);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    // page 2
    const data2 = await listSongs(filter, 1, 1);
    expect(data2?.data.total).toBe(3);
    expect(data2?.data.songs.length).toBe(1);
    expect(data2?.data.songs[0]?.title).toBe('02 Second Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
    // page 3
    const data3 = await listSongs(filter, 2, 1);
    expect(data3?.data.total).toBe(3);
    expect(data3?.data.songs.length).toBe(1);
    expect(data3?.data.songs[0]?.title).toBe('03 Third Track');
    expect(data3?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data3?.data.songs[0]?.additional.song_tag.album).toBe('Album 3');
  });

  it('should list genre songs', async () => {
    const data = await listSongs({
      genre: 'Chanson',
    });
    expect(data?.data.total).toBe(4);
    expect(data?.data.songs.length).toBe(4);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[3]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 4');
  });

  it('should paginate genre songs', async () => {
    const filter = { genre: 'Chanson' };
    // page 1
    const data = await listSongs(filter, 0, 1);
    expect(data?.data.total).toBe(4);
    expect(data?.data.songs.length).toBe(1);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    // page 2
    const data2 = await listSongs(filter, 1, 2);
    expect(data2?.data.total).toBe(4);
    expect(data2?.data.songs.length).toBe(2);
    expect(data2?.data.songs[0]?.title).toBe('02 Second Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data2?.data.songs[1]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list genre album songs', async () => {
    const data = await listSongs({
      album: 'Album 5',
      album_artist: 'Artist 3',
      genre: 'Chanson',
    });
    expect(data?.data.total).toBe(3);
    expect(data?.data.songs.length).toBe(3);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate genre album songs', async () => {
    const filter = {
      album: 'Album 5',
      album_artist: 'Artist 3',
      genre: 'Chanson',
    };
    // page 1
    const data = await listSongs(filter, 0, 2);
    expect(data?.data.total).toBe(3);
    expect(data?.data.songs.length).toBe(2);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 5');
    // page 2
    const data2 = await listSongs(filter, 2, 2);
    expect(data2?.data.total).toBe(3);
    expect(data2?.data.songs.length).toBe(1);
    expect(data2?.data.songs[0]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should list default genre songs', async () => {
    const data = await listSongs({
      genre_filter: 'Ballad',
    });
    expect(data?.data.total).toBe(2);
    expect(data?.data.songs.length).toBe(2);
    expect(data?.data.songs[0]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[1]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 3');
  });

  it.todo('should paginate default genre songs');

  it('should list multi-genre songs', async () => {
    const data = await listSongs({
      genre_filter: 'EDM/Dance',
    });
    expect(data?.data.total).toBe(2);
    expect(data?.data.songs.length).toBe(2);
    expect(data?.data.songs[0]?.title).toBe('06 Sixth Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[1]?.title).toBe('03 Third Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 2');
  });

  it.todo('should paginate multi-genre songs');

  it('should list default genre album songs', async () => {
    const data = await listSongs({
      album: 'Album 1',
      album_artist: 'Artist 1',
      genre_filter: 'Ballad',
    });
    expect(data?.data.total).toBe(1);
    expect(data?.data.songs.length).toBe(1);
    expect(data?.data.songs[0]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 1');
  });

  it.todo('should paginate default genre album songs');

  it('should list multi-genre album songs', async () => {
    const data = await listSongs({
      genre_filter: 'Ballad/Acid',
    });
    expect(data?.data.total).toBe(6);
    expect(data?.data.songs.length).toBe(6);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[3]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[4]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[4]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[5]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[5]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[5]?.additional.song_tag.album).toBe('Album 3');
  });

  it.todo('should paginate multi-genre album songs');

  it('should list all songs with no filters', async () => {
    const data = await listSongs({});
    expect(data?.data.total).toBe(27);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[3]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[4]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[4]?.additional.song_tag.album).toBe('Album 1');

    expect(data?.data.songs[5]?.title).toBe('01 First Track');
    expect(data?.data.songs[5]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[5]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[6]?.title).toBe('02 Second Track');
    expect(data?.data.songs[6]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[6]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[7]?.title).toBe('03 Third Track');
    expect(data?.data.songs[7]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[7]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[8]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[8]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[8]?.additional.song_tag.album).toBe('Album 2');

    expect(data?.data.songs[9]?.title).toBe('01 First Track');
    expect(data?.data.songs[9]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[9]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[10]?.title).toBe('02 Second Track');
    expect(data?.data.songs[10]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[10]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[11]?.title).toBe('03 Third Track');
    expect(data?.data.songs[11]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[11]?.additional.song_tag.album).toBe('Album 2');

    expect(data?.data.songs[12]?.title).toBe('01 First Track');
    expect(data?.data.songs[12]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[12]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[13]?.title).toBe('02 Second Track');
    expect(data?.data.songs[13]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[13]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[14]?.title).toBe('03 Third Track');
    expect(data?.data.songs[14]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[14]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[15]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[15]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[15]?.additional.song_tag.album).toBe('Album 3');
    expect(data?.data.songs[16]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[16]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data?.data.songs[16]?.additional.song_tag.album).toBe('Album 3');

    expect(data?.data.songs[17]?.title).toBe('01 First Track');
    expect(data?.data.songs[17]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[17]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[18]?.title).toBe('02 Second Track');
    expect(data?.data.songs[18]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[18]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[19]?.title).toBe('03 Third Track');
    expect(data?.data.songs[19]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[19]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[20]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[20]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[20]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[21]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[21]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data?.data.songs[21]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[22]?.title).toBe('06 Sixth Track');
    expect(data?.data.songs[22]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );

    expect(data?.data.songs[22]?.additional.song_tag.album).toBe('Album 4');
    expect(data?.data.songs[23]?.title).toBe('01 First Track');
    expect(data?.data.songs[23]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data?.data.songs[23]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[24]?.title).toBe('02 Second Track');
    expect(data?.data.songs[24]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[24]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[25]?.title).toBe('03 Third Track');
    expect(data?.data.songs[25]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[25]?.additional.song_tag.album).toBe('Album 5');
    expect(data?.data.songs[26]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[26]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data?.data.songs[26]?.additional.song_tag.album).toBe('Album 5');
  });

  it('should paginate all songs with no filter', async () => {
    // page 1
    const data = await listSongs({}, 0, 10);
    expect(data?.data.total).toBe(27);
    expect(data?.data.songs.length).toBe(10);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[0]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[1]?.title).toBe('02 Second Track');
    expect(data?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[1]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[2]?.title).toBe('03 Third Track');
    expect(data?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[2]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[3]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[3]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[3]?.additional.song_tag.album).toBe('Album 1');
    expect(data?.data.songs[4]?.title).toBe('05 Fifth Track');
    expect(data?.data.songs[4]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[4]?.additional.song_tag.album).toBe('Album 1');

    expect(data?.data.songs[5]?.title).toBe('01 First Track');
    expect(data?.data.songs[5]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[5]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[6]?.title).toBe('02 Second Track');
    expect(data?.data.songs[6]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[6]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[7]?.title).toBe('03 Third Track');
    expect(data?.data.songs[7]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[7]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[8]?.title).toBe('04 Fourth Track');
    expect(data?.data.songs[8]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[8]?.additional.song_tag.album).toBe('Album 2');
    expect(data?.data.songs[9]?.title).toBe('01 First Track');
    expect(data?.data.songs[9]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data?.data.songs[9]?.additional.song_tag.album).toBe('Album 2');
    // page 2
    const data2 = await listSongs({}, 10, 10);
    expect(data2?.data.total).toBe(27);
    expect(data2?.data.songs[0]?.title).toBe('02 Second Track');
    expect(data2?.data.songs[0]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data2?.data.songs[0]?.additional.song_tag.album).toBe('Album 2');
    expect(data2?.data.songs[1]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[1]?.additional.song_tag.artist).toBe('Artist 1');
    expect(data2?.data.songs[1]?.additional.song_tag.album).toBe('Album 2');
    expect(data2?.data.songs[2]?.title).toBe('01 First Track');
    expect(data2?.data.songs[2]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[2]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[3]?.title).toBe('02 Second Track');
    expect(data2?.data.songs[3]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[3]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[4]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[4]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[4]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[5]?.title).toBe('04 Fourth Track');
    expect(data2?.data.songs[5]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[5]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[6]?.title).toBe('05 Fifth Track');
    expect(data2?.data.songs[6]?.additional.song_tag.artist).toBe('Artist 2');
    expect(data2?.data.songs[6]?.additional.song_tag.album).toBe('Album 3');
    expect(data2?.data.songs[7]?.title).toBe('01 First Track');
    expect(data2?.data.songs[7]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[7]?.additional.song_tag.album).toBe('Album 4');
    expect(data2?.data.songs[8]?.title).toBe('02 Second Track');
    expect(data2?.data.songs[8]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data2?.data.songs[8]?.additional.song_tag.album).toBe('Album 4');
    expect(data2?.data.songs[9]?.title).toBe('03 Third Track');
    expect(data2?.data.songs[9]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data2?.data.songs[9]?.additional.song_tag.album).toBe('Album 4');
    // page 3
    const data3 = await listSongs({}, 20, 10);
    expect(data3?.data.total).toBe(27);
    expect(data3?.data.songs.length).toBe(7);
    expect(data3?.data.songs[0]?.title).toBe('04 Fourth Track');
    expect(data3?.data.songs[0]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data3?.data.songs[0]?.additional.song_tag.album).toBe('Album 4');
    expect(data3?.data.songs[1]?.title).toBe('05 Fifth Track');
    expect(data3?.data.songs[1]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data3?.data.songs[1]?.additional.song_tag.album).toBe('Album 4');
    expect(data3?.data.songs[2]?.title).toBe('06 Sixth Track');
    expect(data3?.data.songs[2]?.additional.song_tag.artist).toBe(
      'Artist 3, Artist 2',
    );
    expect(data3?.data.songs[2]?.additional.song_tag.album).toBe('Album 4');

    expect(data3?.data.songs[3]?.title).toBe('01 First Track');
    expect(data3?.data.songs[3]?.additional.song_tag.artist).toBe(
      'Artist 3 ft. Artist 2',
    );
    expect(data3?.data.songs[3]?.additional.song_tag.album).toBe('Album 5');
    expect(data3?.data.songs[4]?.title).toBe('02 Second Track');
    expect(data3?.data.songs[4]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data3?.data.songs[4]?.additional.song_tag.album).toBe('Album 5');
    expect(data3?.data.songs[5]?.title).toBe('03 Third Track');
    expect(data3?.data.songs[5]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data3?.data.songs[5]?.additional.song_tag.album).toBe('Album 5');
    expect(data3?.data.songs[6]?.title).toBe('04 Fourth Track');
    expect(data3?.data.songs[6]?.additional.song_tag.artist).toBe('Artist 3');
    expect(data3?.data.songs[6]?.additional.song_tag.album).toBe('Album 5');
  });
});
