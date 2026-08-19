import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import {
  api,
  createTestAccount,
  deleteAccount,
  extraAdminsCleared,
  listAccounts,
  signInDefaultAccount,
} from '../../../test-helper';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/api/admin/delete-account', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/admin/delete-account`, {
        params: {
          query: {
            accountId: 1,
          },
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const { error } = await deleteAccount(2, false);
      expect(error?.message[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await deleteAccount(0);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject only administrator', async () => {
      await extraAdminsCleared();
      const users = await listAccounts();
      const adminUser = users.data?.accounts.find((user) => user.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin account found');
      }
      const { error } = await deleteAccount(adminUser.id);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });
  });

  describe('success', () => {
    it('should delete an account successfully', async () => {
      // create a user
      const username = `user-${Date.now()}`;
      const account = await createTestAccount(username, 'test-123', [UserRoleEnum.user]);
      // delete it
      const { error, data: data2 } = await deleteAccount(account.id);
      expect(error).toBeUndefined();
      expect(data2?.success).toBe(true);
      // verify it
      const users = await listAccounts();
      const deletedAccount = users.data?.accounts.find((user) => user.username === username);
      expect(deletedAccount).toBeUndefined();
    });
  });
});
