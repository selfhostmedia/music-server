import { ErrorCodes } from '../../../constants/error-codes';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { api, createAdminApi, createUserApi, guestApi } from '../../../test-helper';

describe('/api/user/reset-password', () => {
  const deleteAccounts: number[] = [];
  let adminApi;

  beforeAll(async () => {
    adminApi = await createAdminApi();
  });

  afterAll(async () => {
    await adminApi.deleteTestData(deleteAccounts);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.POST(`/api/user/reset-password`, {
        body: {
          newPassword: 'testpassword',
        },
        params: {
          header: {
            Authorization: '',
          },
        },
      });
      expect(error?.error).toBe(ErrorCodes.FORBIDDEN_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject missing password', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error } = await accountApi.resetPassword('');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
      deleteAccounts.push(account.id);
    });

    it('should reject invalid password length', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      const { error } = await accountApi.resetPassword('x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
      deleteAccounts.push(account.id);
    });
  });

  describe('success', () => {
    it('should reset user password', async () => {
      const account = await adminApi.createTestAccount();
      const accountApi = await createUserApi(account.username, account.password);
      // reset their password
      const { data } = await accountApi.resetPassword('newpassword');
      expect(data?.success).toBe(true);
      // verify it
      const { data: newSession } = await guestApi.createSession(account.username, 'newpassword');
      expect(newSession?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
