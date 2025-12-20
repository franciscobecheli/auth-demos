import type { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyPluginAsync } from 'fastify';
import { type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { env } from '../env.js';
import { schema } from '../schemas.js';
import { isCredentialValid } from '../utils.js';
import { type JWTUserData, jwtCredentials } from './credentials.js';

const JWT_SECRET = env.JWT_SECRET;
const JWT_ALG = 'HS256';
const JWT_ISSUER = env.JWT_ISSUER;
const JWT_AUDIENCE = env.JWT_AUDIENCE;

export const routes: FastifyPluginAsync = async (fastify, _options) => {
  const f = fastify.withTypeProvider<JsonSchemaToTsProvider>();

  f.post('/bearer/jwt/login', { schema }, async (request, reply) => {
    // Again, commented out for localhost. See basic auth.
    // if (!isHttps(request)) {
    //   return replyUnauthorized(reply);
    // }

    const { username, password } = request.body;
    if (!isCredentialValid({ username, password }, jwtCredentials)) {
      return replyUnauthorized(reply);
    }

    const user = getUserFromUsername(username, jwtCredentials);
    if (!user) {
      return replyUnauthorized(reply);
    }

    // JWT allows you to store non-sensitive information on the token itself.
    // That way, you dont have to hit the db to know the user's id and
    // permissions, for example. Beware, this data is NOT encrypted, only
    // encoded (base64), so never generate tokens with sensitive information
    // stored.
    const jwtClaims = { sub: user.id, permissions: user.permissions };

    const jwt = await generateJWT(
      JWT_SECRET,
      JWT_ALG,
      JWT_ISSUER,
      JWT_AUDIENCE,
      jwtClaims,
    );

    return reply.send({ jwt });
  });

  f.get('/bearer/jwt/protected-resource', async (request, reply) => {
    const jwt = parseAuthHeader(request.headers.authorization);
    if (!jwt) {
      return replyUnauthorized(reply);
    }

    const jwtPayload = await verifyJWT(
      jwt,
      JWT_SECRET,
      JWT_ISSUER,
      JWT_AUDIENCE,
    );
    if (!jwtPayload) {
      return replyUnauthorized(reply);
    }

    return replyProtectedResource(reply);
  });
};

const getUserFromUsername = (
  username: string,
  dbCredentials: Array<JWTUserData>,
) => {
  return dbCredentials.find(
    (dbCredential) => dbCredential.username === username,
  );
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
    .header('WWW-Authenticate', 'Bearer realm="Access to protected resource"')
    .status(401)
    .send({ error: 'Unauthorized' });
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

const generateJWT = async (
  jwtSecret: string,
  algorithm: string,
  issuer: string,
  audience: string,
  claims?: Record<string, unknown>,
) => {
  const secret = new TextEncoder().encode(jwtSecret);
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt()
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('2h')
    .sign(secret);
};

const verifyJWT = async (
  jwt: string,
  jwtSecret: string,
  issuer: string,
  audience: string,
): Promise<JWTPayload | null> => {
  const secret = new TextEncoder().encode(jwtSecret);
  try {
    const { payload, protectedHeader } = await jwtVerify(jwt, secret, {
      issuer: issuer,
      audience: audience,
      clockTolerance: '5s', // Prevents server clock drift from breaking tokens
      // If someone, somehow, issues a token with no expiry date (exp), jose
      // will always accept it. This param prevents forever valid tokens
      maxTokenAge: '2h',
    });
    console.log(protectedHeader);
    console.log(payload);
    return payload;
  } catch (error: unknown) {
    console.log(error);
    return null;
  }
};

const replyProtectedResource = <
  R extends { status: (code: number) => R; send: (body: unknown) => R },
>(
  reply: R,
): R => {
  // Symbolic object representing a protected resource
  return reply
    .status(200)
    .send({ jwt_protected_resource: 'jwt_protected_resource_data' });
};
