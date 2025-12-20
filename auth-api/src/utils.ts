import { verify } from 'argon2';
import type { FastifyRequest } from 'fastify';
import type { BasicAuthCredential } from './basic/credentials.js';
import type { BearerOpaqueCredential } from './bearer-token/credentials.js';

const verifyPassword = async (password: string, hashedPassword: string) => {
  return verify(hashedPassword, password);
};

export const isCredentialValid = async (
  credentials: BasicAuthCredential,
  dbCredentials: Array<BasicAuthCredential>,
): Promise<boolean> => {
  for (const dbCredential of dbCredentials) {
    if (dbCredential.username === credentials.username) {
      const ok = await verifyPassword(
        credentials.password,
        dbCredential.password,
      );

      if (ok) return true;
    }
  }
  return false;
};

export const getUserFromToken = (
  accessToken: string,
  dbCredentials: Array<BearerOpaqueCredential>,
): BearerOpaqueCredential | null => {
  const user = dbCredentials.find(
    (dbCredential) => dbCredential.token === accessToken,
  );

  if (!user) {
    return null;
  }

  return user;
};

export const isHttps = (request: FastifyRequest) => {
  return (
    request.protocol === 'https' ||
    request.headers['x-forwarded-proto'] === 'https' // Allows reverse-proxy
  );
};
