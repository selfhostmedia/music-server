import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  api,
  createSession,
  createTestAccount,
  deleteTestData,
  resetUserPassword,
  signInDefaultAccount,
} from '../../../test-helper';

describe('/api/admin/reset-user-password', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/admin/reset-user-password`, {
        body: {
          newPassword: 'testpassword',
        },
        params: {
          query: {
            id: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const { error } = await resetUserPassword(1, 'test-123', false);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await resetUserPassword(0, 'new-password');
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject missing password', async () => {
      const { error } = await resetUserPassword(1, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const { error } = await resetUserPassword(1, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should reset user password', async () => {
      // create a user
      const username = `username-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      // reset their password
      const { data } = await resetUserPassword(account.id, 'newpassword');
      expect(data?.success).toBe(true);
      // verify it
      const newSession = await createSession(username, 'newpassword');
      expect(newSession.data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
