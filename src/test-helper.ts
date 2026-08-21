import { GuestCreateSessionResponseDto } from './api/guest/create-session/create-session.dto';
import { UserRoleEnum, components, paths } from './types/api-schema';
import createClient from 'openapi-fetch';

let administratorJwtToken: string;
let userJwtToken: string;

export const ADMIN_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
export const USER_USERNAME = process.env.DEFAULT_USER_USERNAME || 'user';
export const USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'user';

export const api: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});

export function createSession(username: string, password: string, expiresDays?: number) {
  return api.POST(`/api/guest/create-session`, {
    body: {
      username,
      password,
      ...(expiresDays !== undefined ? { expiresDays } : {}),
    },
  });
}
export function clearSessionToken(administrator = true) {
  if (administrator) {
    administratorJwtToken = '';
  } else {
    userJwtToken = '';
  }
}

export function getAuthenticationHeaders(administrator = true) {
  if (administrator) {
    if (!administratorJwtToken) {
      throw new Error(`Administrator JWT token is not set. Call signInDefaultAccount() first.`);
    }
    return {
      Authorization: `Bearer ${administratorJwtToken}`,
    };
  }
  if (!userJwtToken) {
    throw new Error(`User JWT token is not set. Call signInDefaultAccount() first.`);
  }
  return {
    Authorization: `Bearer ${userJwtToken}`,
  };
}

export async function createAccount(username: string, password: string, roles: UserRoleEnum[], administrator = true) {
  const response = await api.POST(`/api/admin/create-account`, {
    body: {
      username,
      password,
      roles,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function listAccounts(administrator = true) {
  const response = await api.GET(`/api/admin/list-accounts`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function listRootPaths(administrator = true) {
  const response = await api.GET(`/api/admin/list-root-paths`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function createRootPath(accountId: number, rootPath: string, administrator = true) {
  const response = await api.POST(`/api/admin/create-root-path`, {
    body: {
      rootPath,
    },
    params: {
      query: {
        id: accountId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function deleteAccount(accountId: number, administrator = true) {
  const response = await api.DELETE(`/api/admin/delete-account`, {
    params: {
      query: {
        id: accountId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function deleteRootPath(rootPathId: number, administrator = true) {
  const response = await api.DELETE(`/api/admin/delete-root-path`, {
    params: {
      query: {
        id: rootPathId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function getIndexerConfiguration(administrator = true) {
  const response = await api.GET(`/api/admin/indexer-configuration`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function setIndexerStatus(enabled: boolean, administrator = true) {
  const response = await api.PATCH(`/api/admin/set-indexer-status`, {
    body: {
      enabled,
    },
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function listIndexerLogs(administrator = true) {
  const response = await api.GET(`/api/admin/list-indexer-logs`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function regenerateMasterSessionKey(administrator = true) {
  const response = await api.POST(`/api/admin/regenerate-master-session-key`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function regenerateUserSessionKey(accountId: number, administrator = true) {
  const response = await api.POST(`/api/admin/regenerate-user-session-key`, {
    params: {
      query: {
        accountId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function endUserSession(administrator = true) {
  const response = await api.DELETE(`/api/user/end-session`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function resetUserPassword(accountId: number, newPassword: string, administrator = true) {
  const response = await api.POST(`/api/admin/reset-user-password`, {
    body: {
      newPassword,
    },
    params: {
      query: {
        id: accountId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function updateRootPath(rootPathId: number, newPath: string, administrator = true) {
  const response = await api.PATCH(`/api/admin/update-root-path`, {
    body: {
      newPath,
    },
    params: {
      query: {
        id: rootPathId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function updateUserRoles(accountId: number, roles: UserRoleEnum[], administrator = true) {
  const response = await api.PATCH(`/api/admin/update-user-roles`, {
    body: {
      roles,
    },
    params: {
      query: {
        accountId,
      },
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

export async function endSession(administrator = true) {
  const response = await api.DELETE(`/api/user/end-session`, {
    params: {
      header: {
        ...getAuthenticationHeaders(administrator),
      },
    },
  });
  return response;
}

type AccountDto = components['schemas']['AdminAccountDto'];

export async function createTestAccount(
  username: string,
  password: string,
  roles: UserRoleEnum[],
): Promise<AccountDto> {
  await createAccount(username, password, roles);
  const { data } = await listAccounts();
  const account = data?.accounts.find((user) => user.username === username);
  if (!account) {
    throw new Error('No account found');
  }
  return account;
}

export async function deleteTestData(accountIds: number[]) {
  for (let i = 0; i < accountIds.length; i += 1) {
    const accountId = accountIds[i];
    if (accountId) {
      // eslint-disable-next-line no-await-in-loop
      await deleteAccount(accountId);
    }
  }
}

export async function createJwtToken(username: string, password: string): Promise<string> {
  const { data } = await createSession(username, password);
  const signIn = data as unknown as GuestCreateSessionResponseDto;
  if (!signIn.jwtToken) {
    throw new Error(`Failed to create JWT token for ${username}`);
  }
  return signIn.jwtToken;
}

export async function signInDefaultAccount(administrator = true) {
  if (administrator) {
    if (administratorJwtToken) {
      return;
    }
  } else if (userJwtToken) {
    return;
  }
  if (!administrator) {
    // ensure test user exists
    await api.POST(`/api/admin/create-account`, {
      body: {
        username: 'user-only',
        password: 'user-only',
        roles: [UserRoleEnum.user],
      },
      params: {
        header: {
          ...getAuthenticationHeaders(),
        },
      },
    });
  }
  const jwtToken = await createJwtToken(
    administrator ? process.env.DEFAULT_ADMIN_USERNAME || 'admin' : 'user-only',
    administrator ? process.env.DEFAULT_ADMIN_PASSWORD || 'admin' : 'user-only',
  );
  if (administrator) {
    administratorJwtToken = jwtToken;
  } else {
    userJwtToken = jwtToken;
  }
}

export async function extraAdminsCleared() {
  const accounts = await listAccounts();
  const adminUsers = accounts.data?.accounts.filter((user) => user.roles.includes(UserRoleEnum.admin));
  if (adminUsers?.length === 1) {
    return true;
  }
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  return extraAdminsCleared();
}
