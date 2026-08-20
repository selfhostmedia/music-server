import {
  SmartPlaylistConjugalEnum,
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
  components,
  paths,
} from './types/api-schema';
import {
  SynologyDefaultGenreResponseDto,
  SynologyEntryCertificateResponseDto,
  SynologyEntryListPinsResponseDto,
  SynologyEntrySignInResponseDto,
  SynologyGenreResponseDto,
  SynologyPlaylistIdResponseDto,
  SynologyPlaylistResponseDto,
  SynologyPlaylistWithItemsResponseDto,
  SynologyRadioItemDto,
  SynologyRadioItemResponseDto,
  SynologySearchResponseDto,
} from './api/synology-audiostation/dtos';
import { SynologySuccessResponseDto } from './api/synology-audiostation/dtos/synology.dto';
import { expect } from '@jest/globals';
import createClient from 'openapi-fetch';
import crypto from 'node:crypto';

let sessionId: string;
let deviceId: string;

export const api: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});

export function encryptCredentials(username: string, password: string, publicKeyPem: string) {
  const plaintext = `account=${username}&passwd=${password}`;
  const publicKeyData = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
  const publicKey = crypto.createPublicKey({
    key: publicKeyData,
    format: 'pem',
    type: 'spki',
  });
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(plaintext, 'utf8'),
  );
  return encrypted.toString('base64');
}

export function clearSessionToken() {
  sessionId = '';
  deviceId = '';
}

export function getAuthenticationHeaders() {
  if (!sessionId || !deviceId) {
    throw new Error(`Session ID and device ID are not set.  Call signInEntryCgi() first.`);
  }
  return {
    cookie: `id=${sessionId}; did=${deviceId}`,
  };
}

export async function createSignInCookie() {
  if (sessionId && deviceId) {
    return;
  }
  // get the encryption key
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
  // encrypt the payload
  const payload = encryptCredentials(
    process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    process.env.DEFAULT_ADMIN_PASSWORD || 'admin',
    encryptionKey.data.public_key,
  );
  // do the sign in
  const signinResponse = await api.POST(`/webapi/entry.cgi`, {
    body: {
      __cIpHeRtExT: payload,
      client_time: encryptionKey.data.server_time,
    },
  });
  const signIn = signinResponse?.data as SynologyEntrySignInResponseDto;
  sessionId = signIn.data.sid;
  deviceId = signIn.data.did;
}

type AlbumFilter = {
  artist?: string;
  composer?: string;
  genre?: string;
};

type ArtistFilter = {
  genre?: string;
};

type ComposerFilter = {
  genre?: string;
};

type SongFilter = {
  album?: string;
  album_artist?: string;
  composer?: string;
  genre?: string;
  genre_filter?: string;
};

type SynologyEntryNewPinItemDto = components['schemas']['SynologyEntryNewPinItemDto'];

export async function addFavorite(items: SynologyEntryNewPinItemDto[]) {
  type BodyType = components['schemas']['SynologyEntryCreatePinBodyDto'];
  const body: BodyType = {
    api: SynologyApiEnum.SYNO_AudioStation_Pin,
    method: SynologyMethodEnum.pin,
    version: 1,
    items,
  };
  const { data, error } = await api.POST('/webapi/entry.cgi', {
    body,
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyEntryListPinsResponseDto;
  return typedData;
}

export async function search(keyword: string) {
  const { data, error } = await api.POST('/webapi/AudioStation/search.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Search,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      keyword,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologySearchResponseDto;
  expect(typedData?.data.artistTotal).toBeDefined();
  expect(typedData?.data.albumTotal).toBeDefined();
  expect(typedData?.data.songTotal).toBeDefined();
  return typedData;
}

export async function listFolders(id?: string, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/folder.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Folder,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  expect(error).toBeUndefined();
  return data;
}

export async function listDefaultGenres(offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/genre.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Genre,
      method: SynologyMethodEnum.list_default_genre,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyDefaultGenreResponseDto;
  expect(typedData?.data.total).toBeDefined();
  expect(typedData?.data.default_genres).toBeDefined();
  return typedData;
}

export async function listGenres(offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/genre.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Genre,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyGenreResponseDto;
  expect(typedData?.data.total).toBeDefined();
  expect(typedData?.data.genres).toBeDefined();
  return typedData;
}

export async function listComposers(filters: ComposerFilter, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/composer.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Composer,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  expect(data?.data.total).toBeDefined();
  expect(data?.data.composers).toBeDefined();
  return data;
}

export async function listAlbums(filters: AlbumFilter, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/album.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Album,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  expect(data?.data.total).toBeDefined();
  expect(data?.data.albums).toBeDefined();
  return data;
}

export async function listArtists(filters: ArtistFilter, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/artist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Artist,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      offset: offset || 0,
      limit: limit || 100000,
      ...filters,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  expect(data?.data.total).toBeDefined();
  expect(data?.data.artists).toBeDefined();
  return data;
}

export async function listSongs(filters: SongFilter, offset?: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/song.cgi', {
    body: {
      additional: 'avg_rating',
      api: SynologyApiEnum.SYNO_AudioStation_Song,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
      ...filters,
      offset: offset || 0,
      limit: limit || 100000,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  expect(data?.data.total).toBeDefined();
  expect(data?.data.songs).toBeDefined();
  return data;
}

export async function retrievePlaylistInfo(id: string) {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.getinfo,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyPlaylistResponseDto;
  if (!typedData?.data?.playlists?.[0]) {
    throw new Error(`Playlist with id ${id} not found`);
  }
  expect(typedData.data.playlists).toBeDefined();
  expect(typedData.data.playlists.length).toBe(1);
  return typedData.data.playlists[0];
}

export async function listPlaylists() {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.list,
      version: 1,
      library: SynologyLibraryEnum.all,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyPlaylistResponseDto;
  expect(typedData.data.playlists).toBeDefined();
  return typedData.data.playlists;
}

export async function createPlaylist(
  name: string,
  type: 'normal' | 'smart',
  conj_rule?: SmartPlaylistConjugalEnum,
  rules_json?: string,
) {
  const method = type === 'normal' ? SynologyMethodEnum.create : SynologyMethodEnum.createsmart;
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method,
      version: 1,
      library: SynologyLibraryEnum.all,
      name,
      ...(type === 'smart' ? { conj_rule, rules_json } : {}),
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyPlaylistIdResponseDto;
  expect(typedData.data.id).toBeDefined();
  return typedData.data.id;
}

export async function updatePlaylist(
  id: string,
  name: string,
  type: 'normal' | 'smart',
  conj_rule?: SmartPlaylistConjugalEnum,
  rules_json?: string,
) {
  const method = type === 'normal' ? SynologyMethodEnum.rename : SynologyMethodEnum.updatesmart;
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method,
      version: 1,
      library: SynologyLibraryEnum.all,
      id,
      ...(type === 'smart' ? { name } : { new_name: name }),
      ...(type === 'smart' ? { conj_rule, rules_json } : {}),
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyPlaylistIdResponseDto;
  expect(typedData.data.id).toBeDefined();
  return typedData.data.id;
}

export async function addItemToPlaylist(playlistId: string, items: (number | string)[]) {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
      offset: -1,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologySuccessResponseDto;
  expect(typedData.success).toBe(true);
}

export type PlaylistContainerItem =
  | { album: string; album_artist: string }
  | { artist: string }
  | { composer: string }
  | { genre: string };

type SynologyEntryPlaylistAddBodyDto =
  | components['schemas']['SynologyEntryPlaylistAddAlbumBodyDto']
  | components['schemas']['SynologyEntryPlaylistAddArtistBodyDto']
  | components['schemas']['SynologyEntryPlaylistAddComposerBodyDto']
  | components['schemas']['SynologyEntryPlaylistAddGenreBodyDto'];

export async function addContainerToPlaylist(playlistId: string, item: PlaylistContainerItem) {
  const body: SynologyEntryPlaylistAddBodyDto = {
    api: SynologyApiEnum.SYNO_AudioStation_Playlist,
    method: SynologyMethodEnum.add_track,
    version: 1,
    id: playlistId,
    ...item,
  };
  const { data, error } = await api.POST('/webapi/entry.cgi', {
    body,
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  return data;
}

export async function removeItemFromPlaylist(playlistId: string, offset: number, limit?: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: '',
      offset,
      limit: limit || 1,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  return data;
}

export async function movePlaylistItems(playlistId: string, items: (number | string)[], offset: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.updatesongs,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
      songs: items.map((id) => (typeof id === 'number' && id > 0 ? `music_${id}` : id)).join(','),
      offset,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologySuccessResponseDto;
  expect(typedData.success).toBe(true);
}

export async function getPlaylistItems(playlistId: string) {
  const { data, error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Playlist,
      method: SynologyMethodEnum.getsonginfo,
      version: 1,
      library: SynologyLibraryEnum.all,
      id: playlistId,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
  const typedData = data as unknown as SynologyPlaylistWithItemsResponseDto;
  expect(typedData.data.playlists[0]).toBeDefined();
  return typedData.data.playlists[0];
}

export async function createTestStation(
  container: 'User defined' | 'My favorite',
  title: string,
  desc: string,
  url: string,
  offset = -1,
) {
  const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
      method: SynologyMethodEnum.updateradios,
      version: 1,
      offset,
      limit: 0,
      radios_json: JSON.stringify([
        {
          title,
          url,
          desc,
        },
      ]),
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  const typedData = data as unknown as SynologySuccessResponseDto;
  expect(error).toBeUndefined();
  expect(typedData.success).toBe(true);
}

export async function getStationIndex(
  container: 'User defined' | 'My favorite',
  title: string,
  url: string,
): Promise<number> {
  const { data: listData, error: listError } = await api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
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
  const typedListData = listData as unknown as SynologyRadioItemResponseDto;
  expect(listError).toBeUndefined();
  const index = typedListData.data.radios.findIndex((item) => item.title === title && item.url === url);
  expect(index).toBeGreaterThanOrEqual(0);
  return index;
}

export async function listStationsInContainer(
  container: 'User defined' | 'My favorite' | 'SHOUTcast' | string,
): Promise<SynologyRadioItemDto[]> {
  const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
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
  const typedData = data as unknown as SynologyRadioItemResponseDto;
  expect(error).toBeUndefined();
  return typedData.data.radios;
}

export async function deleteStation(container: 'User defined' | 'My favorite', stationIndex: number) {
  const { data, error } = await api.POST('/webapi/AudioStation/radio.cgi', {
    body: {
      api: SynologyApiEnum.SYNO_AudioStation_Radio,
      container,
      method: SynologyMethodEnum.updateradios,
      version: 1,
      offset: stationIndex,
      limit: 0,
      radios_json: JSON.stringify([
        {
          title: '',
          url: '',
          desc: '',
        },
      ]),
    },
    params: {
      header: {
        ...getAuthenticationHeaders(),
      },
    },
  });
  const typedData = data as unknown as SynologySuccessResponseDto;
  expect(error).toBeUndefined();
  expect(typedData.success).toBe(true);
}
