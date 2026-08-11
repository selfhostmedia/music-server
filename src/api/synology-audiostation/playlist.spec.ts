import {
  SmartPlaylistConjugal,
  SynologyApiEnum,
  SynologyLibraryEnum,
  SynologyMethodEnum,
} from '../../types/api-schema';
import {
  addItemToPlaylist,
  createPlaylist,
  getPlaylistItems,
  movePlaylistItems,
  removeItemFromPlaylist,
  retrievePlaylistInfo,
  updatePlaylist,
} from '../../test-helper.synology';
import {
  api,
  createSignInCookie,
  getAuthenticationHeaders,
} from '../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/playlist.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should create a "normal" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(name, 'normal');
    expect(newPlaylistId).toBeDefined();
    const playlist = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
  });

  it('should update (rename) a "normal" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(name, 'normal');
    expect(newPlaylistId).toBeDefined();
    const newName = `Updated playlist ${Date.now()}`;
    const updatedPlaylistId = await updatePlaylist(
      newPlaylistId,
      newName,
      'normal',
    );
    const playlist = await retrievePlaylistInfo(updatedPlaylistId);
    expect(playlist.name).toBe(newName);
    expect(playlist.type).toBe('normal');
  });

  it('should create a "smart" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugal.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    expect(newPlaylistId).toBeDefined();
    const playlist = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(1);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[0]?.op).toBe(1);
    expect(playlist.additional.rules?.[0]?.tag).toBe(1);
    expect(playlist.additional.rules?.[0]?.interval).toBe(0);
  });

  it('should update a "smart" playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugal.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    expect(newPlaylistId).toBeDefined();
    const newName = `Updated playlist ${Date.now()}`;
    const updatedPlaylistId = await updatePlaylist(
      newPlaylistId,
      newName,
      'smart',
      SmartPlaylistConjugal.and,
      JSON.stringify([
        {
          interval: 1,
          tag: 2,
          op: 3,
          tagval: 'Text 2',
        },
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    const playlist = await retrievePlaylistInfo(updatedPlaylistId);
    expect(playlist.name).toBe(newName);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(2);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Text 2');
    expect(playlist.additional.rules?.[0]?.op).toBe(3);
    expect(playlist.additional.rules?.[0]?.tag).toBe(2);
    expect(playlist.additional.rules?.[0]?.interval).toBe(1);
    expect(playlist.additional.rules?.[1]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[1]?.op).toBe(1);
    expect(playlist.additional.rules?.[1]?.tag).toBe(1);
    expect(playlist.additional.rules?.[1]?.interval).toBe(0);
  });

  it('should delete a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(name, 'normal');
    expect(newPlaylistId).toBeDefined();
    const playlist = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
    const { error } = await api.POST('/webapi/AudioStation/playlist.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Playlist,
        method: SynologyMethodEnum.delete,
        version: 1,
        library: SynologyLibraryEnum.all,
        id: newPlaylistId,
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
    expect(error).toBeUndefined();
    // try and reload it
    await expect(retrievePlaylistInfo(newPlaylistId)).rejects.toThrow();
  });

  it('should get "normal" playlist info', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(name, 'normal');
    expect(newPlaylistId).toBeDefined();
    const playlist = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('normal');
    expect(playlist.additional.rules_conjunction).toBeUndefined();
    expect(playlist.additional.rules).toBeUndefined();
  });

  it('should get "smart" playlist info', async () => {
    const name = `Test playlist ${Date.now()}`;
    const newPlaylistId = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugal.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    expect(newPlaylistId).toBeDefined();
    const playlist = await retrievePlaylistInfo(newPlaylistId);
    expect(playlist.name).toBe(name);
    expect(playlist.type).toBe('smart');
    expect(playlist.additional.rules_conjunction).toBe('and');
    expect(playlist.additional.rules).toBeDefined();
    expect(playlist.additional.rules?.length).toBe(1);
    expect(playlist.additional.rules?.[0]?.tagval).toBe('Artist 1');
    expect(playlist.additional.rules?.[0]?.op).toBe(1);
    expect(playlist.additional.rules?.[0]?.tag).toBe(1);
    expect(playlist.additional.rules?.[0]?.interval).toBe(0);
  });

  it('should get items from a playlist', async () => {});

  it('should reject adding to a smart playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(
      name,
      'smart',
      SmartPlaylistConjugal.and,
      JSON.stringify([
        {
          interval: 0,
          tag: 1,
          op: 1,
          tagval: 'Artist 1',
        },
      ]),
    );
    await expect(addItemToPlaylist(playlistId, [1])).rejects.toThrow();
  });

  it('should add song to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(1);
    expect(contents?.additional.songs?.[0]?.id).toBeDefined();
  });

  it('should add radio to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [
      'radio_Station 1 http://station1.url',
    ]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(1);
    expect(contents?.additional.songs?.[0]?.id).toBeDefined();
  });

  it('should add multiple songs and radios to a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [
      1,
      2,
      3,
      'radio_Station 2 http://station2.url',
      'radio_Station 3 http://station3.url',
    ]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[3]?.id).toBe(
      `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"Station 2"}\n http://station2.url}`,
    );
    expect(contents?.additional.songs?.[4]?.id).toBe(
      `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"Station 3"}\n http://station3.url}`,
    );
  });

  it('should remove item from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(1);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    await removeItemFromPlaylist(playlistId, 0);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(0);
  });

  it('should remove items from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(3);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    await removeItemFromPlaylist(playlistId, 1, 2);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(1);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_1');
  });

  it('should reposition remaining items from a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3, 4, 5]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[0]?.position).toBe(1);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[1]?.position).toBe(2);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[2]?.position).toBe(3);
    expect(contents?.additional.songs?.[3]?.id).toBe(`music_4`);
    expect(contents?.additional.songs?.[3]?.position).toBe(4);
    expect(contents?.additional.songs?.[4]?.id).toBe(`music_5`);
    expect(contents?.additional.songs?.[4]?.position).toBe(5);
    await removeItemFromPlaylist(playlistId, 1, 2);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(3);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_1');
    expect(updatedContents?.additional.songs?.[0]?.position).toBe(1);
    expect(updatedContents?.additional.songs?.[1]?.id).toBe('music_4');
    expect(updatedContents?.additional.songs?.[1]?.position).toBe(2);
    expect(updatedContents?.additional.songs?.[2]?.id).toBe('music_5');
    expect(updatedContents?.additional.songs?.[2]?.position).toBe(3);
  });

  it('should move items up a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3, 4, 5]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[0]?.position).toBe(1);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[1]?.position).toBe(2);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[2]?.position).toBe(3);
    expect(contents?.additional.songs?.[3]?.id).toBe(`music_4`);
    expect(contents?.additional.songs?.[3]?.position).toBe(4);
    expect(contents?.additional.songs?.[4]?.id).toBe(`music_5`);
    expect(contents?.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [3, 4], 1);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(5);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_1');
    expect(updatedContents?.additional.songs?.[0]?.position).toBe(1);
    expect(updatedContents?.additional.songs?.[1]?.id).toBe('music_3');
    expect(updatedContents?.additional.songs?.[1]?.position).toBe(2);
    expect(updatedContents?.additional.songs?.[2]?.id).toBe('music_4');
    expect(updatedContents?.additional.songs?.[2]?.position).toBe(3);
    expect(updatedContents?.additional.songs?.[3]?.id).toBe('music_2');
    expect(updatedContents?.additional.songs?.[3]?.position).toBe(4);
    expect(updatedContents?.additional.songs?.[4]?.id).toBe('music_5');
    expect(updatedContents?.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move disparate items up a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3, 4, 5]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[0]?.position).toBe(1);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[1]?.position).toBe(2);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[2]?.position).toBe(3);
    expect(contents?.additional.songs?.[3]?.id).toBe(`music_4`);
    expect(contents?.additional.songs?.[3]?.position).toBe(4);
    expect(contents?.additional.songs?.[4]?.id).toBe(`music_5`);
    expect(contents?.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [4, 5], 0);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(5);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_4');
    expect(updatedContents?.additional.songs?.[0]?.position).toBe(1);
    expect(updatedContents?.additional.songs?.[1]?.id).toBe('music_5');
    expect(updatedContents?.additional.songs?.[1]?.position).toBe(2);
    expect(updatedContents?.additional.songs?.[2]?.id).toBe('music_1');
    expect(updatedContents?.additional.songs?.[2]?.position).toBe(3);
    expect(updatedContents?.additional.songs?.[3]?.id).toBe('music_2');
    expect(updatedContents?.additional.songs?.[3]?.position).toBe(4);
    expect(updatedContents?.additional.songs?.[4]?.id).toBe('music_3');
    expect(updatedContents?.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move items down a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3, 4, 5]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[0]?.position).toBe(1);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[1]?.position).toBe(2);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[2]?.position).toBe(3);
    expect(contents?.additional.songs?.[3]?.id).toBe(`music_4`);
    expect(contents?.additional.songs?.[3]?.position).toBe(4);
    expect(contents?.additional.songs?.[4]?.id).toBe(`music_5`);
    expect(contents?.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [1, 2], 3);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(5);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_3');
    expect(updatedContents?.additional.songs?.[0]?.position).toBe(1);
    expect(updatedContents?.additional.songs?.[1]?.id).toBe('music_4');
    expect(updatedContents?.additional.songs?.[1]?.position).toBe(2);
    expect(updatedContents?.additional.songs?.[2]?.id).toBe('music_5');
    expect(updatedContents?.additional.songs?.[2]?.position).toBe(3);
    expect(updatedContents?.additional.songs?.[3]?.id).toBe('music_1');
    expect(updatedContents?.additional.songs?.[3]?.position).toBe(4);
    expect(updatedContents?.additional.songs?.[4]?.id).toBe('music_2');
    expect(updatedContents?.additional.songs?.[4]?.position).toBe(5);
  });

  it('should move disparate items down a playlist', async () => {
    const name = `Test playlist ${Date.now()}`;
    const playlistId = await createPlaylist(name, 'normal');
    await addItemToPlaylist(playlistId, [1, 2, 3, 4, 5]);
    const contents = await getPlaylistItems(playlistId);
    expect(contents?.additional.songs).toBeDefined();
    expect(contents?.additional.songs?.length).toBe(5);
    expect(contents?.additional.songs?.[0]?.id).toBe(`music_1`);
    expect(contents?.additional.songs?.[0]?.position).toBe(1);
    expect(contents?.additional.songs?.[1]?.id).toBe(`music_2`);
    expect(contents?.additional.songs?.[1]?.position).toBe(2);
    expect(contents?.additional.songs?.[2]?.id).toBe(`music_3`);
    expect(contents?.additional.songs?.[2]?.position).toBe(3);
    expect(contents?.additional.songs?.[3]?.id).toBe(`music_4`);
    expect(contents?.additional.songs?.[3]?.position).toBe(4);
    expect(contents?.additional.songs?.[4]?.id).toBe(`music_5`);
    expect(contents?.additional.songs?.[4]?.position).toBe(5);
    await movePlaylistItems(playlistId, [1, 4], 4);
    const updatedContents = await getPlaylistItems(playlistId);
    expect(updatedContents?.additional.songs?.length).toBe(5);
    expect(updatedContents?.additional.songs?.[0]?.id).toBe('music_2');
    expect(updatedContents?.additional.songs?.[0]?.position).toBe(1);
    expect(updatedContents?.additional.songs?.[1]?.id).toBe('music_3');
    expect(updatedContents?.additional.songs?.[1]?.position).toBe(2);
    expect(updatedContents?.additional.songs?.[2]?.id).toBe('music_5');
    expect(updatedContents?.additional.songs?.[2]?.position).toBe(3);
    expect(updatedContents?.additional.songs?.[3]?.id).toBe('music_1');
    expect(updatedContents?.additional.songs?.[3]?.position).toBe(4);
    expect(updatedContents?.additional.songs?.[4]?.id).toBe('music_4');
    expect(updatedContents?.additional.songs?.[4]?.position).toBe(5);
  });
});
