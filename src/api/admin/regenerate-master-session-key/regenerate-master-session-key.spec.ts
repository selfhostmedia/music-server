import { ErrorCodes } from '../../../constants/error-codes';
import {
  api,
  clearSessionToken,
  deleteAccount,
  listAccounts,
  regenerateMasterSessionKey,
  signInDefaultAccount,
} from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/regenerate-master-session-key', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/admin/regenerate-master-session-key`, {
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
      const { error } = await deleteAccount(2, false);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('success', () => {
    // note: enabling this test will break the other tests that require a valid session key, so it is skipped for now
    it.skip('should generate new master session key', async () => {
      const { error, data } = await regenerateMasterSessionKey();
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      const { error: error2 } = await listAccounts();
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      await clearSessionToken(true);
      await clearSessionToken(false);
    });
  });
});
