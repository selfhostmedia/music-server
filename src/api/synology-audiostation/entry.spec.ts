import { SynologyApiEnum, SynologyMethodEnum, SynologyPinTypeEnum } from '../../types/api-schema';
import {
  SynologyEntryCertificateResponseDto,
  SynologyEntryListPinsResponseDto,
  SynologyEntrySignInResponseDto,
} from './dtos';
import {
  addContainerToPlaylist,
  addFavorite,
  api,
  clearSessionToken,
  createPlaylist,
  createSignInCookie,
  encryptCredentials,
  getAuthenticationHeaders,
  getPlaylistItems,
} from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/entry.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  describe('authentication', () => {
    it('should return encryption key and field names', async () => {
      const { data, error } = await api.POST('/webapi/entry.cgi', {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      expect(error).toBeUndefined();
      const typedData = data as SynologyEntryCertificateResponseDto;
      expect(typedData?.data?.public_key.length).toBeGreaterThan(0);
      expect(typedData?.data?.cipherkey.length).toBeGreaterThan(0);
      expect(typedData?.data?.ciphertoken.length).toBeGreaterThan(0);
    });

    it('should sign in successfully', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as SynologyEntryCertificateResponseDto;
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptCredentials(
        process.env.DEFAULT_USERNAME || 'admin',
        process.env.DEFAULT_PASSWORD || 'admin',
        encryptionKey.data.public_key,
      );
      const { error, data } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeUndefined();
      const typedData = data as SynologyEntrySignInResponseDto;
      expect(typedData?.data?.sid.length).toBeGreaterThan(0);
      expect(typedData?.data?.did.length).toBeGreaterThan(0);
    });

    it('should reject invalid account username', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as SynologyEntryCertificateResponseDto;
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptCredentials(
        'fred',
        process.env.DEFAULT_PASSWORD || 'admin',
        encryptionKey.data.public_key,
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('invalid-username-error');
    });

    it('should reject invalid account password', async () => {
      const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
        body: {
          api: SynologyApiEnum.SYNO_API_Encryption,
          method: SynologyMethodEnum.getinfo,
          version: 1,
        },
      });
      const encryptionKey = encryptionKeyResponse?.data as SynologyEntryCertificateResponseDto;
      if (!encryptionKey?.data?.public_key?.length) {
        throw new Error(`Failed to get encryption key`);
      }
      const payload = encryptCredentials(
        process.env.DEFAULT_USERNAME || 'admin',
        'pony123',
        encryptionKey.data.public_key,
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: encryptionKey.data.server_time,
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('invalid-password-error');
    });

    it('should reject invalid public key', async () => {
      const payload = encryptCredentials(
        process.env.DEFAULT_USERNAME || 'admin',
        process.env.DEFAULT_PASSWORD || 'admin',
        [
          'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAygDdPPqBY3P1IWl7rsoP',
          '/M6MV/yBABTuQaPjJg8Yt8xWtH5xg/hdSXYeqme+DcajL2xg8hY2pqUVAVUWHscT',
          '0000000000000000000000000000000000000000000000000000000+EvzRiivB',
          'VQsuamCxwUvk2va8zhvZrWwqukI3nFG823wdME/0000000000000000000000000',
          '000000000000000000000000000000000000000000000000000000000000000/',
          '8oY9UpM6bmGK4QuWns8ZOOcWLN1RGIs9WaAzISVJZJ4cpC18vbj+000000000000',
          '000000000000000000000000+2FWpPZ47U0lmjZrJHa8N+awKJn7GvA+uxskjo+0',
          '00000000000000000000000000000000000000000000000/kkC0ICVTXaAgl749',
          'n/00000000000000000000000/fsM1PSfBHHEectZMdpaaHbU3Um+00000+oFfnZ',
          '5m7h1vWHI0fu/0000000000000000000+cC4DoUCxE0O0w48Db98pWMkAXgUGIo8',
          '7l3ZX+L9iXvg2vNPug+0OZSfZ7MbtXL51BnK/CXKaSgHYrBJb62V9jms8YZkunDx',
          'TTBzr2U7+Bc6mLeBhA0wE80CAwEAAQ==',
        ].join(''),
      );
      const { error } = await api.POST(`/webapi/entry.cgi`, {
        body: {
          __cIpHeRtExT: payload,
          client_time: Math.floor(new Date().getTime() / 1000),
        },
      });
      expect(error).toBeDefined();
      expect((error as unknown as { message: string[] }).message[0]).toBe('Invalid encrypted payload');
    });

    it('should clearSessionToken', async () => {
      const { data } = await api.POST('/webapi/entry.cgi', {
        body: {
          api: SynologyApiEnum.SYNO_API_Auth,
          method: SynologyMethodEnum.clearSessionToken,
          version: 1,
        },
        params: {
          header: {
            ...getAuthenticationHeaders(),
          },
        },
      });
      expect(data?.success).toBe(true);
      await clearSessionToken();
    });
  });

  describe('favorites', () => {
    beforeAll(async () => {
      await createSignInCookie();
    });

    it('should list favorite items', async () => {});

    it('should favorite "recently added" playlist', async () => {
      const data = await addFavorite([
        {
          criteria: {},
          name: 'Recently Added',
          type: SynologyPinTypeEnum.recently_added,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(data?.data.items?.some((item) => item.type.toString() === SynologyPinTypeEnum.recently_added)).toBe(true);
    });

    it('should favorite "random 100" playlist', async () => {
      const data = await addFavorite([
        {
          criteria: {},
          name: 'Random100',
          type: SynologyPinTypeEnum.random_100,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(data?.data.items?.some((item) => item.type.toString() === SynologyPinTypeEnum.random_100)).toBe(true);
    });

    it('should favorite root folder', async () => {
      const data = await addFavorite([
        {
          criteria: {
            folder: '1',
          },
          name: 'Root Folder',
          type: SynologyPinTypeEnum.folder,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some((item) => item.type.toString() === SynologyPinTypeEnum.folder && item.name === 'root-1'),
      ).toBe(true);
    });

    it('should favorite nested folder', async () => {
      const data = await addFavorite([
        {
          criteria: {
            folder: '5',
          },
          name: 'Nested Folder',
          type: SynologyPinTypeEnum.folder,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some(
          (item) => item.type.toString() === SynologyPinTypeEnum.folder && item.name === 'Album 2',
        ),
      ).toBe(true);
    });

    it('should favorite artist', async () => {
      const data = await addFavorite([
        {
          criteria: {
            artist: 'Artist 1',
          },
          name: 'Artist 1',
          type: SynologyPinTypeEnum.artist,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some(
          (item) => item.type.toString() === SynologyPinTypeEnum.artist && item.name === 'Artist 1',
        ),
      ).toBe(true);
    });

    it('should favorite composer', async () => {
      const data = await addFavorite([
        {
          criteria: {
            composer: 'Composer 1',
          },
          name: 'Composer 1',
          type: SynologyPinTypeEnum.composer,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some(
          (item) => item.type.toString() === SynologyPinTypeEnum.composer && item.name === 'Composer 1',
        ),
      ).toBe(true);
    });

    it('should favorite genre', async () => {
      const data = await addFavorite([
        {
          criteria: {
            genre: 'Acid',
          },
          name: 'Acid',
          type: SynologyPinTypeEnum.genre,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some((item) => item.type.toString() === SynologyPinTypeEnum.genre && item.name === 'Acid'),
      ).toBe(true);
    });

    it('should favorite album', async () => {
      const data = await addFavorite([
        {
          criteria: {
            album: 'Album 1',
            album_artist: 'Artist 1',
          },
          name: 'Album 1',
          type: SynologyPinTypeEnum.album,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some((item) => item.type.toString() === SynologyPinTypeEnum.album && item.name === 'Album 1'),
      ).toBe(true);
    });

    it('should favorite playlist', async () => {
      const playlistId = await createPlaylist('Test Playlist', 'normal');
      const data = await addFavorite([
        {
          criteria: {
            playlist: playlistId,
          },
          name: 'Test Playlist',
          type: SynologyPinTypeEnum.playlist,
        },
      ]);
      expect(data?.success).toBe(true);
      expect(data?.data.items?.length).toBeGreaterThan(0);
      expect(
        data?.data.items?.some(
          (item) => item.type.toString() === SynologyPinTypeEnum.playlist && item.name === 'Test Playlist',
        ),
      ).toBe(true);
    });

    it('should unfavorite items', async () => {
      const data = await addFavorite([
        {
          criteria: {
            album: 'Album 1',
          },
          name: 'Album 1',
          type: SynologyPinTypeEnum.album,
        },
      ]);
      const favorite = data?.data.items?.find(
        (item) => item.type.toString() === SynologyPinTypeEnum.album && item.name === 'Album 1',
      );
      expect(favorite).toBeDefined();
      const { data: unpinData, error: unpinError } = await api.POST('/webapi/entry.cgi', {
        body: {
          api: SynologyApiEnum.SYNO_AudioStation_Pin,
          method: SynologyMethodEnum.unpin,
          version: 1,
          items: JSON.stringify([Number.parseInt(favorite?.id || '0', 10)]),
        },
        params: {
          header: {
            ...getAuthenticationHeaders(),
          },
        },
      });
      const typedUnpinData = unpinData as SynologyEntryListPinsResponseDto;
      expect(unpinError).toBeUndefined();
      expect(typedUnpinData?.success).toBe(true);
      expect(typedUnpinData?.data.items?.some((item) => item.id === favorite?.id)).toBe(false);
    });
  });

  describe('playlists', () => {
    beforeAll(async () => {
      await createSignInCookie();
    });

    it('should add album to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const playlistId = await createPlaylist(playlistName, 'normal');
      const data = await addContainerToPlaylist(playlistId, {
        album: 'Album 1',
        album_artist: 'Artist 1',
      });
      expect(data?.success).toBe(true);
      const data2 = await getPlaylistItems(playlistId);
      expect(
        data2?.additional.songs.some(
          (item) =>
            item.additional.song_tag.album === 'Album 1' && item.additional.song_tag.album_artist === 'Artist 1',
        ),
      ).toBe(true);
    });

    it('should add artist to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const playlistId = await createPlaylist(playlistName, 'normal');
      const data = await addContainerToPlaylist(playlistId, {
        artist: 'Artist 1',
      });
      expect(data?.success).toBe(true);
      const data2 = await getPlaylistItems(playlistId);
      expect(data2?.additional.songs.some((item) => item.additional.song_tag.artist === 'Artist 1')).toBe(true);
    });

    it('should add composer to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const playlistId = await createPlaylist(playlistName, 'normal');
      const data = await addContainerToPlaylist(playlistId, {
        composer: 'Composer 4',
      });
      expect(data?.success).toBe(true);
      const data2 = await getPlaylistItems(playlistId);
      expect(data2?.additional.songs.some((item) => item.additional.song_tag.composer === 'Composer 4')).toBe(true);
    });

    it('should add genre to playlist', async () => {
      const playlistName = `Test Playlist ${new Date().getTime()}`;
      const playlistId = await createPlaylist(playlistName, 'normal');
      const data = await addContainerToPlaylist(playlistId, {
        genre: 'Acid',
      });
      expect(data?.success).toBe(true);
      const data2 = await getPlaylistItems(playlistId);
      expect(data2?.additional.songs.some((item) => item.additional.song_tag.genre === 'Acid')).toBe(true);
    });
  });
});
