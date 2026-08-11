import { ShoutcastItemType } from '../../types/enums';
import {
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
} from '../../types/api-schema';
import { SynologyRadioItemResponseDto } from './dtos';
import {
  api,
  createSignInCookie,
  getAuthenticationHeaders,
} from '../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';
import {
  createTestStation,
  deleteStation,
  getStationIndex,
  listStationsInContainer,
} from '../../test-helper.synology';

describe('/webapi/AudioStation/radio.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should add a new user-defined station', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'User defined',
      title,
      'A test station for unit testing',
      url,
    );
    const radios = await listStationsInContainer('User defined');
    expect(
      radios.some((item) => item.title === title && item.url === url),
    ).toBe(true);
  });

  it('should update an existing user-defined station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'User defined',
      title,
      'A test station for unit testing',
      url,
    );
    // get the station index
    const stationIndex = await getStationIndex('User defined', title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    const updatedDesc = 'An updated test station for unit testing';
    const updatedUrl = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'User defined',
      updatedTitle,
      updatedDesc,
      updatedUrl,
      stationIndex,
    );
    // verify update
    const radios = await listStationsInContainer('User defined');
    expect(
      radios.some(
        (item) =>
          item.title === updatedTitle &&
          item.url === updatedUrl &&
          item.desc === updatedDesc,
      ),
    ).toBe(true);
  });

  it('should delete an existing user-defined station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'User defined',
      title,
      'Another test station for unit testing',
      url,
    );
    // get the station index
    const stationIndex = await getStationIndex('User defined', title, url);
    // delete the station
    await deleteStation('User defined', stationIndex);
    // verify delete
    const radios = await listStationsInContainer('User defined');
    expect(
      radios.some((item) => item.title === title && item.url === url),
    ).toBe(false);
  });

  it('should add a new favorite station', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'My favorite',
      title,
      'A test station for unit testing',
      url,
    );
    const radios = await listStationsInContainer('My favorite');
    expect(
      radios.some((item) => item.title === title && item.url === url),
    ).toBe(true);
  });

  it('should update an existing favorite station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'My favorite',
      title,
      'A test station for unit testing',
      url,
    );
    // get the station index
    const stationIndex = await getStationIndex('My favorite', title, url);
    // update the station
    const updatedTitle = `${title} - Updated`;
    await createTestStation(
      'My favorite',
      updatedTitle,
      'A test station for unit testing',
      url,
      stationIndex,
    );
    // verify update
    const radios = await listStationsInContainer('My favorite');
    expect(
      radios.some((item) => item.title === updatedTitle && item.url === url),
    ).toBe(true);
  });

  it('should delete an existing favorite station', async () => {
    // create the station
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'My favorite',
      title,
      'Another test station for unit testing',
      url,
    );
    // get the station index
    const stationIndex = await getStationIndex('My favorite', title, url);
    // delete the station
    await deleteStation('My favorite', stationIndex);
    // verify delete
    const radios = await listStationsInContainer('My favorite');
    expect(
      radios.some((item) => item.title === title && item.url === url),
    ).toBe(false);
  });

  it('should list all containers', async () => {
    const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        method: SynologyMethodEnum.list,
        version: 1,
        library: SynologyLibraryEnum.all,
        offset: 0,
        limit: 100000,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    const typedData = data as unknown as SynologyRadioItemResponseDto;
    expect(error).toBeUndefined();
    expect(typedData.data.radios.length).toBe(3);
    expect(
      typedData.data.radios.every(
        (item) => item.type === ShoutcastItemType.CONTAINER,
      ),
    ).toBe(true);
    expect(typedData.data.radios[0]?.title).toBe('SHOUTcast');
    expect(typedData.data.radios[1]?.title).toBe('User defined');
    expect(typedData.data.radios[2]?.title).toBe('My favorite');
  });

  it('should list all genres in SHOUTcast container', async () => {
    const genres = await listStationsInContainer('SHOUTcast');
    expect(genres.length).toBeGreaterThan(0);
    expect(
      genres.every((item) => item.type === ShoutcastItemType.CONTAINER),
    ).toBe(true);
  });

  it('should list all SHOUTcast stations in container + genre', async () => {
    const radios = await listStationsInContainer('SHOUTcast_genre_Blues');
    expect(radios.length).toBeGreaterThan(0);
    expect(
      radios.every((item) => item.type === ShoutcastItemType.STATION),
    ).toBe(true);
    expect(radios.every((item) => item.url?.length > 0)).toBe(true);
  });

  it('should list all stations in user container', async () => {
    const title = `Test Station ${Date.now()}`;
    const url = `http://yp.shoutcast.com/sbin/tunein-station.pls?id=${Date.now()}`;
    await createTestStation(
      'User defined',
      title,
      'A test station for unit testing',
      url,
    );
    const radios = await listStationsInContainer('User defined');
    expect(
      radios.some((item) => item.title === title && item.url === url),
    ).toBe(true);
  });
});
