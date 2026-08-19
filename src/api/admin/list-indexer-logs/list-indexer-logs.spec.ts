import { ErrorCodes } from '../../../constants/error-codes';
import { api, listIndexerLogs, signInDefaultAccount } from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/list-indexer-logs', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.GET(`/api/admin/list-indexer-logs`, {
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
      const { error } = await listIndexerLogs(false);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('success', () => {
    it('should list indexer logs', async () => {
      const { error, data } = await listIndexerLogs();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      expect(data?.logs.length).toBeGreaterThan(0);
    });
  });
});
