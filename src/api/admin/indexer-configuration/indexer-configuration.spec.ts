import { ErrorCodes } from '../../../constants/error-codes';
import { api, getIndexerConfiguration, setIndexerStatus, signInDefaultAccount } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/indexer-configuration', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/admin/indexer-configuration`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const { error } = await getIndexerConfiguration(false);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('success', () => {
    it('should get the indexer configuration', async () => {
      const { error, data } = await getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
    });

    it('should get the latest indexer configuration', async () => {
      const { error, data } = await getIndexerConfiguration();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      await setIndexerStatus(false);
      const { data: data2 } = await getIndexerConfiguration();
      expect(data2?.success).toBe(true);
      expect(data2?.configuration.id).toBeGreaterThan(data?.configuration.id ?? 0);
      await setIndexerStatus(true);
    });
  });
});
