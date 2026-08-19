import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  api,
  createTestAccount,
  deleteAccount,
  deleteTestData,
  extraAdminsCleared,
  listAccounts,
  signInDefaultAccount,
  updateUserRoles,
} from '../../../test-helper';

describe('/api/admin/update-user-roles', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.PATCH(`/api/admin/update-user-roles`, {
        body: {
          roles: [UserRoleEnum.admin],
        },
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
      const { error } = await updateUserRoles(1, [UserRoleEnum.user], false);
      expect(error?.message[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid account id', async () => {
      const { error } = await updateUserRoles(0, [UserRoleEnum.user]);
      const typedError = error as unknown as Record<string, string | string[]>;
      expect(typedError?.message?.[0]).toBe(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    });

    it('should reject no roles', async () => {
      const username = `username-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      const { error: updateError } = await updateUserRoles(account.id, []);
      expect(updateError?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
      await deleteAccount(account.id);
    });

    it('should reject invalid roles', async () => {
      const { error } = await updateUserRoles(1, ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it(`should reject revoking only admin's role`, async () => {
      await extraAdminsCleared();
      const users = await listAccounts();
      const adminUser = users.data?.accounts.find((a) => a.roles.includes(UserRoleEnum.admin));
      if (!adminUser) {
        throw new Error('No admin user found');
      }
      const { error } = await updateUserRoles(adminUser.id, [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should update user roles', async () => {
      const username = `username-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.admin]);
      // update it
      await updateUserRoles(account.id, [UserRoleEnum.user]);
      // verify it
      const { data: updatedData } = await listAccounts();
      const updatedAccount = updatedData?.accounts.find((a) => a.id === account.id);
      expect(updatedAccount).toBeDefined();
      expect(updatedAccount?.roles.length).toBe(1);
      expect(updatedAccount?.roles[0]).toBe(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });
  });
});
