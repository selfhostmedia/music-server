import { SynologyApiEnum, SynologyMethodEnum } from '../../types/api-schema';
import { SynologyProxySongInfoResponseDto, SynologyProxyStreamInfoResponseDto } from './dtos/proxy.cgi.dto';
import { SynologyRadioItemDto, SynologyRadioItemResponseDto } from './dtos';
import { api, createSignInCookie, getAuthenticationHeaders } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/proxy.cgi', () => {
  let station: SynologyRadioItemDto;

  beforeAll(async () => {
    await createSignInCookie();
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      return;
    }
    const { data } = await api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        container: 'SHOUTcast_genre_Blues',
        method: SynologyMethodEnum.list,
        version: 1,
        offset: 0,
        limit: 100000,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    const typedData = data as SynologyRadioItemResponseDto;
    if (!typedData?.data.radios?.[0]) {
      throw new Error('No radios found in SHOUTcast_genre_Blues container');
    }
    station = typedData.data.radios[0] as unknown as SynologyRadioItemDto;
  });

  it('should create a stream ID', async () => {
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      expect(true).toBe(true);
      return;
    }
    const { data, error } = await api.POST('/webapi/AudioStation/proxy.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Proxy,
        method: SynologyMethodEnum.getstreamid,
        version: 1,
        id: station.id,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    const typedData = data as unknown as SynologyProxyStreamInfoResponseDto;
    expect(error).toBeUndefined();
    expect(typedData.data.stream_id).toBeDefined();
  });

  it('should return current playing information', async () => {
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      expect(true).toBe(true);
      return;
    }
    // ensure the stream exists
    await api.POST('/webapi/AudioStation/proxy.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Proxy,
        method: SynologyMethodEnum.getstreamid,
        version: 1,
        id: station.id,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    // get the now-playing info
    const streamUrl = station.id.split(' ').pop();
    if (!streamUrl) {
      throw new Error('Stream URL not found in station ID');
    }
    const { data, error } = await api.POST('/webapi/AudioStation/proxy.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Proxy,
        method: SynologyMethodEnum.getsonginfo,
        version: 1,
        // this value is transformed into a number so the posted payload mismatches the type
        // also this ID value is dependent on no other stream having been created, there currently
        // isn't a mechanism for fetching the actual ID which might be 2, 3 etc.
        stream_id: `stream_1` as unknown as number,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    const typedData = data as unknown as SynologyProxySongInfoResponseDto;
    expect(error).toBeUndefined();
    expect(typedData.data.title).toBeDefined();
  });
});
