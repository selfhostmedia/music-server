import { ErrorCodes } from '../../../constants/error-codes';
import { UserRoleEnum } from '../../../types/api-schema';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  api,
  createRootPath,
  createTestAccount,
  deleteRootPath,
  deleteTestData,
  listRootPaths,
  signInDefaultAccount,
} from '../../../test-helper';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';

describe('/api/admin/delete-root-path', () => {
  beforeAll(async () => {
    await signInDefaultAccount(true);
    await signInDefaultAccount(false);
  });

  describe('authorized access', () => {
    it('should reject guest access', async () => {
      const { error } = await api.DELETE(`/api/admin/delete-root-path`, {
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
      const { error } = await deleteRootPath(1, false);
      expect(error?.message[0]).toBe(ErrorCodes.AUTHORIZATION_ERROR);
    });
  });

  describe('errors', () => {
    it('should reject invalid path id', async () => {
      const { error } = await deleteRootPath(1234567890);
      expect(error?.message[0]).toBe(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    });
  });

  describe('success', () => {
    const deleteAccounts: number[] = [];

    afterAll(async () => {
      await deleteTestData(deleteAccounts);
    });
    it('should delete a root path', async () => {
      // create a user
      const username = `username-${Date.now()}`;
      const account = await createTestAccount(username, 'password', [UserRoleEnum.user]);
      // create a root path
      const originalRootPath = join(tmpdir(), `test-delete-root-path-${Date.now()}`);
      mkdirSync(originalRootPath, { recursive: true });
      const { error: error2 } = await createRootPath(account.id, originalRootPath);
      expect(error2).toBeUndefined();
      const rootPathList = await listRootPaths();
      const rootPath = rootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      if (!rootPath) {
        throw new Error('Root path not found after creation');
      }
      // delete it
      const { error: error3, data } = await deleteRootPath(rootPath.id);
      expect(error3).toBeUndefined();
      expect(data?.success).toBe(true);
      // verify it
      const updatedRootPathList = await listRootPaths();
      const deletedRootPath = updatedRootPathList.data?.rootPaths.find((path) => path.rootPath === originalRootPath);
      expect(deletedRootPath).toBeUndefined();
      deleteAccounts.push(account.id);
    });
  });
});
