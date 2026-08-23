import { USER_PASSWORD, USER_USERNAME, api } from './test-helper';
import { guestApi } from './test-helper.api.guest';

type RequestParams = {
  header: {
    Authorization: string;
  };
};

async function createRootPath(params: RequestParams, rootPath: string) {
  return api.POST(`/api/user/create-root-path`, {
    body: {
      rootPath,
    },
    params,
  });
}

async function deleteRootPath(params: RequestParams, rootPathId: number) {
  return api.DELETE(`/api/user/delete-root-path`, {
    params: {
      ...params,
      query: {
        id: rootPathId,
      },
    },
  });
}

async function endSession(params: RequestParams) {
  return api.DELETE(`/api/user/end-session`, {
    params,
  });
}

async function listRootPaths(params: RequestParams) {
  return api.GET(`/api/user/list-root-paths`, {
    params,
  });
}

async function regenerateSessionKey(params: RequestParams) {
  return api.POST(`/api/user/regenerate-session-key`, {
    params,
  });
}

async function resetPassword(params: RequestParams, newPassword: string) {
  return api.POST(`/api/user/reset-password`, {
    body: {
      newPassword,
    },
    params,
  });
}

export type UserApi = {
  createRootPath: (rootPath: string) => ReturnType<typeof createRootPath>;
  deleteRootPath: (rootPathId: number) => ReturnType<typeof deleteRootPath>;
  endSession: () => ReturnType<typeof endSession>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  regenerateSessionKey: () => ReturnType<typeof regenerateSessionKey>;
  resetPassword: (newPassword: string) => ReturnType<typeof resetPassword>;
};

/**
 * Creates an authenticated user API client with the provided username and password or
 * the default user.
 * @param {string | undefined} username Optional username for the user account. Defaults to the default user username.
 * @param {string | undefined} password Optional password for the user account. Defaults to the default user password.
 * @returns {Promise<UserApi>} Object with shortcut functions for User APIs using a session token of from
 * the provided credentials.
 */
export async function createUserApi(username?: string, password?: string): Promise<UserApi> {
  const session = await guestApi.createSession(username || USER_USERNAME, password || USER_PASSWORD);
  const jwtToken = session.data?.jwtToken;
  const params = {
    header: {
      Authorization: `Bearer ${jwtToken}`,
    },
  };

  return {
    async createRootPath(rootPath: string) {
      return createRootPath(params, rootPath);
    },
    async deleteRootPath(rootPathId: number) {
      return deleteRootPath(params, rootPathId);
    },
    async endSession() {
      return endSession(params);
    },
    async listRootPaths() {
      return listRootPaths(params);
    },
    async regenerateSessionKey() {
      return regenerateSessionKey(params);
    },
    async resetPassword(newPassword: string) {
      return resetPassword(params, newPassword);
    },
  };
}
