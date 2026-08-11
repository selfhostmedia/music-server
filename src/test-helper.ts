import { SynologyApiEnum, SynologyMethodEnum, paths } from './types/api-schema';
import {
  SynologyEntryCertificateResponseDto,
  SynologyEntrySignInResponseDto,
} from './api/synology-audiostation/dtos';
import createClient from 'openapi-fetch';
import crypto from 'node:crypto';

let sessionId: string;
let deviceId: string;

export const api: ReturnType<typeof createClient<paths>> = createClient<paths>({
  baseUrl: `http://localhost:${process.env.SERVER_PORT}`,
  credentials: 'include',
});

export function encryptCredentials(
  username: string,
  password: string,
  publicKeyPem: string,
) {
  const plaintext = `account=${username}&passwd=${password}`;
  const publicKeyData = `-----BEGIN PUBLIC KEY-----\n${publicKeyPem}\n-----END PUBLIC KEY-----`;
  const publicKey = crypto.createPublicKey({
    key: publicKeyData,
    format: 'pem',
    type: 'spki',
  });
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(plaintext, 'utf8'),
  );
  return encrypted.toString('base64');
}

export function logout() {
  sessionId = '';
  deviceId = '';
}

export function getAuthenticationHeaders() {
  if (!sessionId || !deviceId) {
    throw new Error(
      `Session ID and device ID are not set.  Call signInEntryCgi() first.`,
    );
  }
  return {
    cookie: `id=${sessionId}; did=${deviceId}`,
    'user-agent': 'test suite',
  };
}

export async function createSignInCookie() {
  if (sessionId && deviceId) {
    return;
  }
  // get the encryption key
  const encryptionKeyResponse = await api.POST(`/webapi/entry.cgi`, {
    body: {
      api: SynologyApiEnum.SYNO_API_Encryption,
      method: SynologyMethodEnum.getinfo,
      version: 1,
    },
    params: {
      header: {
        'user-agent': 'test suite',
      },
    },
  });
  const encryptionKey =
    encryptionKeyResponse?.data as SynologyEntryCertificateResponseDto;
  if (!encryptionKey?.data?.public_key?.length) {
    throw new Error(`Failed to get encryption key`);
  }
  // encrypt the payload
  const payload = encryptCredentials(
    process.env.DEFAULT_USERNAME || 'admin',
    process.env.DEFAULT_PASSWORD || 'admin',
    encryptionKey.data.public_key,
  );
  // do the sign in
  const signinResponse = await api.POST(`/webapi/entry.cgi`, {
    body: {
      __cIpHeRtExT: payload,
      client_time: encryptionKey.data.server_time,
    },
    params: {
      header: {
        'user-agent': 'test suite',
      },
    },
  });
  const signIn = signinResponse?.data as SynologyEntrySignInResponseDto;
  sessionId = signIn.data.sid;
  deviceId = signIn.data.did;
}
