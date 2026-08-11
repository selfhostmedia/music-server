import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie } from '../../test-helper';
import { search } from '../../test-helper.synology';

describe('/webapi/AudioStation/search.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should return artists', async () => {
    const data = await search('artist');
    expect(data?.data.artistTotal).toBe(3);
    expect(data?.data.artists.length).toBe(3);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.artists[1]?.name).toBe('Artist 2');
    expect(data?.data.artists[2]?.name).toBe('Artist 3');
  });

  it('should return albums', async () => {
    const data = await search('album');
    expect(data?.data.albumTotal).toBe(5);
    expect(data?.data.albums.length).toBe(5);
    expect(data?.data.albums[0]?.name).toBe('Album 1');
    expect(data?.data.albums[1]?.name).toBe('Album 3');
    expect(data?.data.albums[2]?.name).toBe('Album 2');
    expect(data?.data.albums[3]?.name).toBe('Album 4');
    expect(data?.data.albums[4]?.name).toBe('Album 5');
  });

  it('should return songs', async () => {
    const data = await search('track');
    expect(data?.data.songTotal).toBe(27);
    expect(data?.data.songs.length).toBe(27);
  });

  it('should return all types', async () => {
    const data = await search('1');
    expect(data?.data.artistTotal).toBe(1);
    expect(data?.data.artists.length).toBe(1);
    expect(data?.data.artists[0]?.name).toBe('Artist 1');
    expect(data?.data.albumTotal).toBe(1);
    expect(data?.data.albums.length).toBe(1);
    expect(data?.data.albums[0]?.name).toBe('Album 1');
    expect(data?.data.songTotal).toBe(6);
    expect(data?.data.songs.length).toBe(6);
    expect(data?.data.songs[0]?.title).toBe('01 First Track');
    expect(data?.data.songs[1]?.title).toBe('01 First Track');
    expect(data?.data.songs[2]?.title).toBe('01 First Track');
    expect(data?.data.songs[3]?.title).toBe('01 First Track');
    expect(data?.data.songs[4]?.title).toBe('01 First Track');
    expect(data?.data.songs[5]?.title).toBe('01 First Track');
  });
});
