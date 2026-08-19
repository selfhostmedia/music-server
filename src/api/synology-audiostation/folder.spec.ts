import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie, listFolders } from '../../test-helper.synology';

describe('/webapi/AudioStation/folder.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list root folders', async () => {
    const data = await listFolders();
    expect(data?.data.items.length).toBe(2);
    expect(data?.data.items[0]?.title).toBe('root-1');
    expect(data?.data.items[1]?.title).toBe('root-2');
  });

  it('should list folders under a root folder', async () => {
    const data = await listFolders('dir_1');
    expect(data?.data.items.length).toBe(2);
    expect(data?.data.items[0]?.title).toBe('Artist 1');
    expect(data?.data.items[1]?.title).toBe('Artist 2');
  });

  it('should list folders under a nested folder', async () => {
    const data = await listFolders('dir_2');
    expect(data?.data.items.length).toBe(2);
    expect(data?.data.items[0]?.title).toBe('Album 1');
    expect(data?.data.items[1]?.title).toBe('Album 2');
  });

  it('should list folders under a deeper-nested folder', async () => {
    const data = await listFolders('dir_5');
    expect(data?.data.items.length).toBe(2);
    expect(data?.data.items[0]?.title).toBe('CD 1');
    expect(data?.data.items[1]?.title).toBe('CD 2');
  });

  it('should list files under a deeper-nested folder', async () => {
    const data = await listFolders('dir_7');
    expect(data?.data.items.length).toBe(4);
    expect(data?.data.items[0]?.title).toBe('01 First Track.flac');
    expect(data?.data.items[1]?.title).toBe('02 Second Track.flac');
    expect(data?.data.items[2]?.title).toBe('03 Third Track.flac');
    expect(data?.data.items[3]?.title).toBe('04 Fourth Track.flac');
  });

  it('should paginate folders', async () => {
    // page 1
    const data = await listFolders('dir_1', 0, 1);
    expect(data?.data.total).toBe(2);
    expect(data?.data.items.length).toBe(1);
    expect(data?.data.items[0]?.title).toBe('Artist 1');
    // page 2
    const data2 = await listFolders('dir_1', 1, 1);
    expect(data2?.data.total).toBe(2);
    expect(data2?.data.items.length).toBe(1);
    expect(data2?.data.items[0]?.title).toBe('Artist 2');
  });
});
