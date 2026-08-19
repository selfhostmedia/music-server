import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie, listArtists } from '../../test-helper.synology';

describe('/webapi/AudioStation/artist.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list artists by genre', async () => {
    const data = await listArtists({ genre: 'Rock' });
    expect(data?.data.artists.length).toBe(2);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.artists[1]?.name).toBe('Artist 3');
  });

  it('should paginate artists by genre', async () => {
    // page 1
    const data = await listArtists({ genre: 'Rock' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.artists.length).toBe(1);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    // page 2
    const data2 = await listArtists({ genre: 'Rock' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.artists.length).toBe(1);
    expect(data2?.data.artists[0]?.name).toBe('Artist 3');
  });

  it('should list all artists with no filters', async () => {
    const data = await listArtists({});
    expect(data?.data.artists.length).toBe(3);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.artists[1]?.name).toBe('Artist 2');
    expect(data?.data.artists[2]?.name).toBe('Artist 3');
  });

  it('should paginate all artists with no filters', async () => {
    // page 1
    const data = await listArtists({}, 0, 1);
    expect(data?.data.total).toBe(3);
    expect(data?.data.artists.length).toBe(1);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    // page 2
    const data2 = await listArtists({}, 1, 1);
    expect(data2?.data.total).toBe(3);
    expect(data2?.data.artists.length).toBe(1);
    expect(data2?.data.artists[0]?.name).toBe('Artist 2');
    // page 3
    const data3 = await listArtists({}, 2, 1);
    expect(data3?.data.total).toBe(3);
    expect(data3?.data.artists.length).toBe(1);
    expect(data3?.data.artists[0]?.name).toBe('Artist 3');
  });

  it('should list artists in default genre', async () => {
    const data = await listArtists({ genre: 'Ballad' });
    expect(data?.data.artists.length).toBe(2);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.artists[1]?.name).toBe('Artist 2');
  });

  it('should paginate artists in default genre', async () => {
    // page 1
    const data = await listArtists({ genre: 'Ballad' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.artists.length).toBe(1);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    // page 2
    const data2 = await listArtists({ genre: 'Ballad' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.artists.length).toBe(1);
    expect(data2?.data.artists[0]?.name).toBe('Artist 2');
  });

  it('should list artists in multi-genre', async () => {
    const data = await listArtists({ genre: 'EDM/Dance' });
    expect(data?.data.artists.length).toBe(2);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.artists[1]?.name).toBe('Artist 3');
  });

  it('should paginate artists in multi-genre', async () => {
    // page 1
    const data = await listArtists({ genre: 'EDM/Dance' }, 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.artists.length).toBe(1);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    // page 2
    const data2 = await listArtists({ genre: 'EDM/Dance' }, 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.artists.length).toBe(1);
    expect(data2?.data.artists[0]?.name).toBe('Artist 3');
  });
});
