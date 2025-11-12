import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from 'fastify';

import {
  type BasicAuthCredentials,
  isCredentialsValid,
} from '../credentials.js';

export async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // Basic Auth has no /login endpoint. You have to pass the credentials via Authorization header to every protected resource you want to access. Then, every one of those endpoints must validate the credentials and deny/allow access
  fastify.get('/basic/protected-resource', async (request, reply) => {
    // This check is extremely important in production. It is disabled here because localhost runs in http (unprotected). Never allow http in production, you will be streaming your credentials for whoever wants to see.
    // if (!isHttps(request)) {
    //   return replyUnauthorized(reply);
    // }

    const credentials = parseAuthHeader(request);
    if (!credentials) {
      return replyUnauthorized(reply);
    }

    if (!(await isCredentialsValid(credentials))) {
      return replyUnauthorized(reply);
    }

    return replyProtectedResource(reply);
  });
}

// biome-ignore lint/correctness/noUnusedVariables: used only in real HTTPS environments
const isHttps = (request: FastifyRequest) => {
  return (
    request.protocol === 'https' ||
    request.headers['x-forwarded-proto'] === 'https' // Allows reverse-proxy
  );
};

// Parses Authorization header and returns credentials if valid. Returns null if the format is invalid. Format must be username:password, base64 encoded in Basic Auth.
const parseAuthHeader = (
  request: FastifyRequest,
): BasicAuthCredentials | null => {
  const basicAuthHeader = request.headers.authorization;
  if (!basicAuthHeader) {
    return null;
  }

  const tokens = basicAuthHeader.split(' ');
  if (
    tokens.length !== 2 ||
    tokens[0] !== 'Basic' ||
    typeof tokens[1] !== 'string'
  ) {
    return null;
  }

  const base64Credentials = tokens[1];
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8',
  );

  const i = decodedCredentials.indexOf(':');
  if (i === -1) return null;

  return {
    username: decodedCredentials.slice(0, i),
    password: decodedCredentials.slice(i + 1),
  };
};

const replyUnauthorized = (reply: FastifyReply): FastifyReply => {
  return reply
    .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
    .status(401)
    .send({ error: 'Unauthorized' });
};

const replyProtectedResource = (reply: FastifyReply): FastifyReply => {
  // Symbolic object representing a protected resource
  return reply
    .status(200)
    .send({ protected_resource: 'protected_resource_data' });
};
