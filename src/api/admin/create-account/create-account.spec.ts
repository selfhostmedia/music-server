import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  api,
  createAccount,
  createTestAccount,
  deleteAccount,
  deleteTestData,
  signInDefaultAccount,
} from '../../../test-helper';

describe('/api/admin/create-account', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/admin/create-account`, {
        body: {
          username: 'testuser',
          password: 'testpassword',
          roles: [UserRoleEnum.admin],
        },
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });

    it('should reject non-admin access', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createAccount(username, 'test-123', [UserRoleEnum.user], false);
      expect(error?.message[0]).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing username', async () => {
      const { error } = await createAccount('', 'test123', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid username length', async () => {
      const { error } = await createAccount('x'.repeat(256), 'test123', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing password', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createAccount(username, '', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createAccount(username, 'x'.repeat(256), [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject no roles', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createAccount(username, 'test123', []);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USER_ROLE_ERROR);
    });

    it('should reject invalid roles', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createAccount(username, 'test123', ['invalidRole' as UserRoleEnum]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_ROLE_ERROR);
    });

    it('should reject duplicate account', async () => {
      const username = `create-invalid-duplicate-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      const { error } = await createAccount(username, 'test123', [UserRoleEnum.user]);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR);
      await deleteAccount(account.id);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should create a new administrator account', async () => {
      const username = `create-new-administrator-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.admin]);
      expect(account.roles.length).toBe(1);
      expect(account.roles[0]).toBe(UserRoleEnum.admin);
      deleteAccounts.push(account.id);
    });

    it('should create a new user account', async () => {
      const username = `create-new-user-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      expect(account.roles.length).toBe(1);
      expect(account.roles[0]).toBe(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });

    it('should create a new administrator+user account', async () => {
      const username = `create-new-administrator+user-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.admin, UserRoleEnum.user]);
      expect(account.roles.length).toBe(2);
      expect(account.roles).toContain(UserRoleEnum.admin);
      expect(account.roles).toContain(UserRoleEnum.user);
      deleteAccounts.push(account.id);
    });
  });
});
