import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie, listAlbums } from '../../test-helper.synology';

describe('/webapi/AudioStation/album.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list albums by genre + artist', async () => {
    const data = await listAlbums({ genre: 'Chanson', artist: 'Artist 3' });
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(2);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    expect(data?.data.albums[1]?.name).toBe('Album 5');
  });

  it('should paginate albums by genre + artist', async () => {
    const filter = { genre: 'Chanson', artist: 'Artist 3' };
    // page 1
    const data = await listAlbums(filter, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    // page 2
    const data2 = await listAlbums(filter, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 5');
  });

  it('should list albums by genre', async () => {
    const data = await listAlbums({ genre: 'Acid' });
    expect(data?.data.total).toBe(1);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 1');
  });

  it('should paginate albums by genre', async () => {
    // page 1
    const data = await listAlbums({ genre: 'Rock' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 2');
    // page 2
    const data2 = await listAlbums({ genre: 'Rock' }, 1, 1);
    expect(data?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 4');
  });

  it('should list albums by default genre', async () => {
    const data = await listAlbums({ genre: 'EDM' });
    expect(data?.data.total).toBe(1);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
  });

  it('should paginate albums by default genre', async () => {
    // page 1
    const data = await listAlbums({ genre: 'EDM' }, 0, 1);
    expect(data?.data.total).toBe(1);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    // page 2
    const data2 = await listAlbums({ genre: 'EDM' }, 1, 1);
    expect(data2?.data.total).toBe(1);
    expect(data2?.data.albums.length).toBe(0);
  });

  it('should list albums by multi-genre', async () => {
    const data = await listAlbums({ genre: 'EDM/Dance' });
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(2);
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 1');
    expect(data?.data.albums[0]?.name).toBe('Album 2');
    expect(data?.data.albums[1]?.album_artist).toBe('Artist 3');
    expect(data?.data.albums[1]?.name).toBe('Album 4');
  });

  it('should paginate albums by multi-genre', async () => {
    // page 1
    const data = await listAlbums({ genre: 'EDM/Dance' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 2');
    // page 2
    const data2 = await listAlbums({ genre: 'EDM/Dance' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 4');
  });

  it('should list albums by composer', async () => {
    const data = await listAlbums({ composer: 'Composer 4' });
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(2);
    expect(data?.data.albums[1]?.name).toBe('Album 4');
    expect(data?.data.albums[1]?.album_artist).toBe('Artist 3');
    expect(data?.data.albums[0]?.name).toBe('Album 3');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 2');
  });

  it('should paginate albums by composer', async () => {
    // page 1
    const data = await listAlbums({ composer: 'Composer 4' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 3');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 2');
    // page 2
    const data2 = await listAlbums({ composer: 'Composer 4' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 4');
    expect(data2?.data.albums[0]?.album_artist).toBe('Artist 3');
  });

  it('should list albums by artist', async () => {
    const data = await listAlbums({ artist: 'Artist 3' });
    expect(data?.data.albums.length).toBe(2);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 3');
    expect(data?.data.albums[1]?.name).toBe('Album 5');
    expect(data?.data.albums[1]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist', async () => {
    // page 1
    const data = await listAlbums({ artist: 'Artist 3' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 3');
    // page 2
    const data2 = await listAlbums({ artist: 'Artist 3' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 5');
    expect(data2?.data.albums[0]?.album_artist).toBe('Artist 3');
  });

  it('should list albums by artist + default genre', async () => {
    const data = await listAlbums({ artist: 'Artist 3', genre: 'EDM' });
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist + default genre', async () => {
    // page 1
    const data = await listAlbums({ artist: 'Artist 3', genre: 'EDM' }, 0, 1);
    expect(data?.data.total).toBe(1);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    // page 2
    const data2 = await listAlbums({ artist: 'Artist 3', genre: 'EDM' }, 1, 1);
    expect(data2?.data.total).toBe(1);
    expect(data2?.data.albums.length).toBe(0);
  });

  it('should list albums by artist in genre', async () => {
    const data = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' });
    expect(data?.data.albums.length).toBe(2);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 3');
    expect(data?.data.albums[1]?.name).toBe('Album 5');
    expect(data?.data.albums[1]?.album_artist).toBe('Artist 3');
  });

  it('should paginate albums by artist in genre', async () => {
    // page 1
    const data = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 4');
    // page 2
    const data2 = await listAlbums({ artist: 'Artist 3', genre: 'Chanson' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 5');
  });

  it('should list all albums with no filters', async () => {
    const data = await listAlbums({});
    expect(data?.data.albums.length).toBe(5);
    expect(data?.data.albums[0]?.name).toBe('Album 1');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 1');
    expect(data?.data.albums[1]?.name).toBe('Album 2');
    expect(data?.data.albums[1]?.album_artist).toBe('Artist 1');
    expect(data?.data.albums[2]?.name).toBe('Album 3');
    expect(data?.data.albums[2]?.album_artist).toBe('Artist 2');
    expect(data?.data.albums[3]?.name).toBe('Album 4');
    expect(data?.data.albums[3]?.album_artist).toBe('Artist 3');
    expect(data?.data.albums[4]?.name).toBe('Album 5');
    expect(data?.data.albums[4]?.album_artist).toBe('Artist 3');
  });

  it('should paginate all albums with no filters', async () => {
    // page 1
    const data = await listAlbums({}, 0, 1);
    expect(data?.data.total).toBe(5);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 1');
    expect(data?.data.albums[0]?.album_artist).toBe('Artist 1');
    // page 2
    const data2 = await listAlbums({}, 1, 1);
    expect(data2?.data.total).toBe(5);
    expect(data2?.data.albums.length).toBe(1);
    expect(data2?.data.albums[0]?.name).toBe('Album 2');
    expect(data2?.data.albums[0]?.album_artist).toBe('Artist 1');
    // page 3
    const data3 = await listAlbums({}, 2, 1);
    expect(data3?.data.total).toBe(5);
    expect(data3?.data.albums.length).toBe(1);
    expect(data3?.data.albums[0]?.name).toBe('Album 3');
  });
});
