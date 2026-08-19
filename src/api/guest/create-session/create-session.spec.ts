import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { createSession, createTestAccount, deleteTestData, signInDefaultAccount } from '../../../test-helper';

describe('/api/guest/create-session', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('errors', () => {
    it('should reject missing username', async () => {
      const { error } = await createSession('', 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_ERROR);
    });

    it('should reject invalid username length', async () => {
      const { error } = await createSession('x'.repeat(256), 'test123');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_USERNAME_LENGTH_ERROR);
    });

    it('should reject missing password', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createSession(username, '');
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_ERROR);
    });

    it('should reject invalid password length', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createSession(username, 'x'.repeat(256));
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR);
    });

    it('should reject invalid expiration', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createSession(username, 'password', 'invalid' as unknown as number);
      expect(error?.message).toContain(ErrorCodes.INVALID_EXPIRES_AT_ERROR);
    });

    it('should reject negative expiration', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createSession(username, 'password', -1);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });

    it('should reject too-long expiration', async () => {
      const username = `username-${Date.now()}`;
      const { error } = await createSession(username, 'password', 65000);
      expect(error?.message[0]).toBe(ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });

    it('should create session', async () => {
      const username = `username-${Date.now()}`;
      const account = await createTestAccount(username, 'test123', [UserRoleEnum.user]);
      const { error, data } = await createSession(username, 'test123');
      expect(error).toBeUndefined();
      expect(data?.jwtToken).toBeDefined();
      deleteAccounts.push(account.id);
    });
  });
});
