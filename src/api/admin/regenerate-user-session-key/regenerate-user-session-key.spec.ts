import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  api,
  createJwtToken,
  createTestAccount,
  deleteTestData,
  regenerateUserSessionKey,
  signInDefaultAccount,
} from '../../../test-helper';

describe('/api/admin/regenerate-user-session-key', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/admin/regenerate-user-session-key`, {
        params: {
          query: {
            accountId: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const { error } = await regenerateUserSessionKey(2, false);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await regenerateUserSessionKey(0);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should generate new user session key', async () => {
      const username = `create-user-with-regenerated-session-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      const jwtToken = await createJwtToken(username, 'test123');
      const { error, data } = await regenerateUserSessionKey(account.id);
      expect(error).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify
      const { error: error2 } = await api.DELETE(`/api/user/end-session`, {
        params: {
          header: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      });
      const typedError2 = error2 as unknown as Record<string, string | string[]>;
      expect(typedError2?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      deleteAccounts.push(account.id);
    });
  });
});
