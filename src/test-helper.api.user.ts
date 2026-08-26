import { USER_PASSWORD, USER_USERNAME, api } from './test-helper';
import { guestApi } from './test-helper.api.guest';
import { paths } from './types/api-schema';

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

type ListAlbumsQueryDto = paths['/api/user/list-albums']['get']['parameters']['query'];

async function listAlbums(params: RequestParams, query?: ListAlbumsQueryDto) {
  return api.GET(`/api/user/list-albums`, {
    params: {
      ...params,
      query,
    },
  });
}

type ListAlbumsWithTracksQueryDto = paths['/api/user/list-albums-with-tracks']['get']['parameters']['query'];

async function listAlbumsWithTracks(params: RequestParams, query?: ListAlbumsWithTracksQueryDto) {
  return api.GET(`/api/user/list-albums-with-tracks`, {
    params: {
      ...params,
      query,
    },
  });
}

async function listIndexerLogs(params: RequestParams) {
  return api.GET(`/api/user/list-indexer-logs`, {
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

async function updatePassword(params: RequestParams, newPassword: string) {
  return api.POST(`/api/user/update-password`, {
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
  listAlbums: (query?: ListAlbumsQueryDto) => ReturnType<typeof listAlbums>;
  listAlbumsWithTracks: (query?: ListAlbumsWithTracksQueryDto) => ReturnType<typeof listAlbumsWithTracks>;
  listIndexerLogs: () => ReturnType<typeof listIndexerLogs>;
  listRootPaths: () => ReturnType<typeof listRootPaths>;
  regenerateSessionKey: () => ReturnType<typeof regenerateSessionKey>;
  updatePassword: (newPassword: string) => ReturnType<typeof updatePassword>;
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
    async listAlbums(query?: ListAlbumsQueryDto) {
      return listAlbums(params, query);
    },
    async listAlbumsWithTracks(query?: ListAlbumsWithTracksQueryDto) {
      return listAlbumsWithTracks(params, query);
    },
    async listIndexerLogs() {
      return listIndexerLogs(params);
    },
    async listRootPaths() {
      return listRootPaths(params);
    },
    async regenerateSessionKey() {
      return regenerateSessionKey(params);
    },
    async updatePassword(newPassword: string) {
      return updatePassword(params, newPassword);
    },
  };
}
