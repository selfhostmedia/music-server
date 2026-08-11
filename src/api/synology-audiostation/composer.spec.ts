import { beforeAll, describe, expect, it } from '@jest/globals';
import { createSignInCookie } from '../../test-helper';
import { listComposers } from '../../test-helper.synology';

describe('/webapi/AudioStation/composer.cgi', () => {
  beforeAll(async () => {
    await createSignInCookie();
  });

  it('should list all composers with no filters', async () => {
    const data = await listComposers({});
    expect(data?.data.composers.length).toBe(15);
    expect(data?.data.composers[0]?.name).toBe('Artist 1, Composer 1');
    expect(data?.data.composers[1]?.name).toBe(
      'Artist 1, Composer 1, Composer 3',
    );
    expect(data?.data.composers[2]?.name).toBe('Artist 1, Composer 2');
    expect(data?.data.composers[3]?.name).toBe(
      'Artist 1, Composer 2, Composer 3',
    );
    expect(data?.data.composers[4]?.name).toBe('Artist 3, Composer 5');
    expect(data?.data.composers[5]?.name).toBe('Composer 1, Artist 2');
    expect(data?.data.composers[6]?.name).toBe('Composer 1, Composer 2');
    expect(data?.data.composers[7]?.name).toBe(
      'Composer 1, Composer 2, Composer 3',
    );
    expect(data?.data.composers[8]?.name).toBe('Composer 2, Composer 3');
    expect(data?.data.composers[9]?.name).toBe('Composer 4');
    expect(data?.data.composers[10]?.name).toBe('Composer 4, Artist 2');
    expect(data?.data.composers[11]?.name).toBe('Composer 5');
    expect(data?.data.composers[12]?.name).toBe('Composer 6');
    expect(data?.data.composers[13]?.name).toBe('Composer 6, Artist 2');
    expect(data?.data.composers[14]?.name).toBe('Composer 6, Composer 7');
  });

  it('should paginate all composers with no filters', async () => {
    // page 1
    const data = await listComposers({}, 0, 5);
    expect(data?.data.total).toBe(15);
    expect(data?.data.composers.length).toBe(5);
    expect(data?.data.composers[0]?.name).toBe('Artist 1, Composer 1');
    expect(data?.data.composers[1]?.name).toBe(
      'Artist 1, Composer 1, Composer 3',
    );
    expect(data?.data.composers[2]?.name).toBe('Artist 1, Composer 2');
    expect(data?.data.composers[3]?.name).toBe(
      'Artist 1, Composer 2, Composer 3',
    );
    expect(data?.data.composers[4]?.name).toBe('Artist 3, Composer 5');
    // page 2
    const data2 = await listComposers({}, 5, 5);
    expect(data2?.data.total).toBe(15);
    expect(data2?.data.composers.length).toBe(5);
    expect(data2?.data.composers[0]?.name).toBe('Composer 1, Artist 2');
    expect(data2?.data.composers[1]?.name).toBe('Composer 1, Composer 2');
    expect(data2?.data.composers[2]?.name).toBe(
      'Composer 1, Composer 2, Composer 3',
    );
    expect(data2?.data.composers[3]?.name).toBe('Composer 2, Composer 3');
    expect(data2?.data.composers[4]?.name).toBe('Composer 4');
    // page 3
    const data3 = await listComposers({}, 10, 5);
    expect(data3?.data.total).toBe(15);
    expect(data3?.data.composers.length).toBe(5);
    expect(data3?.data.composers[0]?.name).toBe('Composer 4, Artist 2');
    expect(data3?.data.composers[1]?.name).toBe('Composer 5');
    expect(data3?.data.composers[2]?.name).toBe('Composer 6');
    expect(data3?.data.composers[3]?.name).toBe('Composer 6, Artist 2');
    expect(data3?.data.composers[4]?.name).toBe('Composer 6, Composer 7');
  });
});
