import { randomBytes } from 'node:crypto';
import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyPluginAsync } from 'fastify';
import { schema } from '../schemas.js';
//biome-ignore  lint/correctness/noUnusedImports: used in production only
import { getUserFromToken, isCredentialValid, isHttps } from '../utils.js';
import {
  type BearerOpaqueCredential,
  bearerOpaqueCredentials,
} from './crendentials.js';

export const routes: FastifyPluginAsync = async (fastify, _options) => {
  const f = fastify.withTypeProvider<JsonSchemaToTsProvider>();

  f.post('/bearer/opaque/login', { schema }, async (request, reply) => {
    // Again, commented out for localhost. See basic auth.
    // if (!isHttps(request)) {
    //   return replyUnauthorized(reply);
    // }

    const { username, password } = request.body;
    if (!isCredentialValid({ username, password }, bearerOpaqueCredentials)) {
      return replyUnauthorized(reply);
    }

    const access_token = randomBytes(32).toString('hex');
    //Save token in "db"
    saveToken(username, access_token);

    return reply.send({ access_token });
  });

  f.get('/bearer/opaque/protected-resource', async (request, reply) => {
    const opaqueToken = parseAuthHeader(request.headers.authorization);

    if (!opaqueToken) {
      return replyUnauthorized(reply);
    }
    /*
      This is the main problem with Opaque tokens.
      On every call to a protected resource, since the token holds no information,
      the endpoint has to hit the database (or an auth service that would hit the
      database itself) to get user data/validate the token. This adds latency to
      every access to protected data. Also, if you wish to add expiration to the
      token, you must do it manually through the database (adding an expireAt
      column, for example).
    */
    const user = getUserFromToken(opaqueToken, bearerOpaqueCredentials);
    if (!user) {
      return replyUnauthorized(reply);
    }

    return replyProtectedResource(reply);
  });
};

const parseAuthHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const tokens = authHeader.split(' ');
  if (
    tokens.length !== 2 ||
    tokens[0] !== 'Bearer' ||
    typeof tokens[1] !== 'string'
  ) {
    return null;
  }

  return tokens[1];
};

const replyUnauthorized = <
  R extends {
    header: (name: string, value: string) => R;
    status: (code: number) => R;
    send: (body: unknown) => R;
  },
>(
  reply: R,
): R => {
  return reply
    .header(
      'WWW-Authenticate',
      'Bearer realm="api", error="invalid_token", error_description="The access token is invalid or expired."',
    )
    .status(401)
    .send({ error: 'Unauthorized' });
};

const saveToken = (
  username: string,
  accessToken: string,
): BearerOpaqueCredential | undefined => {
  const userToUpdate = bearerOpaqueCredentials.find(
    (dbCredential) => dbCredential.username === username,
  );
  if (userToUpdate) {
    userToUpdate.token = accessToken;
  }

  return userToUpdate;
};

const replyProtectedResource = <
  R extends { status: (code: number) => R; send: (body: unknown) => R },
>(
  reply: R,
): R => {
  // Symbolic object representing a protected resource
  return reply
    .status(200)
    .send({ opaque_protected_resource: 'opaque_protected_resource_data' });
};
