import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { api, createJwtToken, createTestAccount, deleteTestData, signInDefaultAccount } from '../../../test-helper';

describe('/api/user/end-session', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/user/end-session`, {
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should end session', async () => {
      const username = `create-session-test-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      // create session
      const jwtToken = await createJwtToken(username, 'test123');
      // end session
      const { error } = await api.DELETE(`/api/user/end-session`, {
        params: {
          header: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      });
      expect(error).toBeUndefined();
      // verify the existing session is now invalid
      const { error: error2 } = await await api.DELETE(`/api/user/end-session`, {
        params: {
          header: {
            Authorization: `Bearer ${jwtToken}`,
          },
        },
      });
      const typedError = error2 as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
      deleteAccounts.push(account.id);
    });
  });
});
