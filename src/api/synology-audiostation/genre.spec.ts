import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie } from '../../test-helper';
import { listDefaultGenres, listGenres } from '../../test-helper.synology';

describe('/webapi/AudioStation/genre.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list all genres with no filters', async () => {
    const data = await listGenres();
    expect(data.data.total).toBe(11);
    expect(data.data.genres.length).toBe(11);
    expect(data.data.genres[0]?.name).toBe('Acid');
    expect(data.data.genres[1]?.name).toBe('Acid Jazz');
    expect(data.data.genres[2]?.name).toBe('Acoustic');
    expect(data.data.genres[3]?.name).toBe('AlternRock');
    expect(data.data.genres[4]?.name).toBe('Ballad');
    expect(data.data.genres[5]?.name).toBe('Bebob');
    expect(data.data.genres[6]?.name).toBe('Bluegrass');
    expect(data.data.genres[7]?.name).toBe('Chanson');
    expect(data.data.genres[8]?.name).toBe('Chorus');
    expect(data.data.genres[9]?.name).toBe('Dance');
    expect(data.data.genres[10]?.name).toBe('EDM');
  });

  it('should paginate all genres with no filters', async () => {
    // page 1
    const data = await listGenres(0, 3);
    expect(data.data.total).toBe(11);
    expect(data.data.genres.length).toBe(3);
    expect(data.data.genres[0]?.name).toBe('Acid');
    expect(data.data.genres[1]?.name).toBe('Acid Jazz');
    expect(data.data.genres[2]?.name).toBe('Acoustic');
    // page 2
    const data2 = await listGenres(3, 3);
    expect(data2.data.total).toBe(11);
    expect(data2.data.genres.length).toBe(3);
    expect(data2.data.genres[0]?.name).toBe('AlternRock');
    expect(data2.data.genres[1]?.name).toBe('Ballad');
    expect(data2.data.genres[2]?.name).toBe('Bebob');
    // page 3
    const data3 = await listGenres(6, 3);
    expect(data3.data.total).toBe(11);
    expect(data3.data.genres.length).toBe(3);
    expect(data3.data.genres[0]?.name).toBe('Bluegrass');
    expect(data3.data.genres[1]?.name).toBe('Chanson');
    expect(data3.data.genres[2]?.name).toBe('Chorus');
    // page 4
    const data4 = await listGenres(9, 3);
    expect(data4.data.total).toBe(11);
    expect(data4.data.genres.length).toBe(2);
    expect(data4.data.genres[0]?.name).toBe('Dance');
    expect(data4.data.genres[1]?.name).toBe('EDM');
  });

  it('should list all default genres', async () => {
    const data = await listDefaultGenres();
    expect(data.data.total).toBe(13);
    expect(data.data.default_genres.length).toBe(13);
    expect(data.data.default_genres[0]?.name).toBe('Ballad');
    expect(data.data.default_genres[1]?.name).toBe('Blues/Soul');
    expect(data.data.default_genres[2]?.name).toBe('Classical');
    expect(data.data.default_genres[3]?.name).toBe('Country');
    expect(data.data.default_genres[4]?.name).toBe('EDM/Dance');
    expect(data.data.default_genres[5]?.name).toBe('Funk');
    expect(data.data.default_genres[6]?.name).toBe('Hip-Hop/R&B');
    expect(data.data.default_genres[7]?.name).toBe('Jazz');
    expect(data.data.default_genres[8]?.name).toBe('Pop');
    expect(data.data.default_genres[9]?.name).toBe('Reggae');
    expect(data.data.default_genres[10]?.name).toBe('Rock/Metal');
    expect(data.data.default_genres[11]?.name).toBe('Soundtrack');
    expect(data.data.default_genres[12]?.name).toBe('World/Spiritual');
  });

  it.todo('should paginate default genres');
});
