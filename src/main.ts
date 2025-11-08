import { fastifyHelmet } from '@fastify/helmet';
import { fastifyRateLimit } from '@fastify/rate-limit';
import { fastify } from 'fastify';
import { basicCredentials } from './credentials.js';

const PORT = 3000;
const HOST = 'localhost';

const app = fastify({
  logger: true,
});

await app.register(fastifyHelmet);
await app.register(fastifyRateLimit, {
  max: 10,
  timeWindow: '1 minute',
});

app.get('/', (_request, reply) => {
  reply.send({ hello: 'world' });
});

app.get('/basic/protected-resource', (request, reply) => {
  if (request.protocol !== 'http') {
    reply
      .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
      .status(401)
      .send({ error: 'Basic Authentication should only be used over HTTPS.' });
    return;
  }

  const basicAuthHeader = request.headers.authorization;
  if (!basicAuthHeader) {
    reply
      .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
      .status(401)
      .send({ error: 'Unauthorized' });
    return;
  }

  const tokens = basicAuthHeader.split(' ');
  if (
    tokens.length !== 2 ||
    tokens[0] !== 'Basic' ||
    typeof tokens[1] !== 'string'
  ) {
    reply
      .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
      .status(401)
      .send({ error: 'Authorization header must be: Basic username:password' });
    return;
  }

  const base64Credentials = tokens[1];
  const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8',
  );

  const credentialTokens = decodedCredentials.split(':');
  if (
    credentialTokens.length !== 2 ||
    !credentialTokens[0] ||
    !credentialTokens[1]
  ) {
    reply
      .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
      .status(401)
      .send({ error: 'Authorization header must be: Basic username:password' });
    return;
  }

  const username = credentialTokens[0];
  const password = credentialTokens[1];
  if (isCredentialsValid(username, password)) {
    reply.status(200).send({ protected_resource: 'protected_resource_data' });
    return;
  }

  reply
    .header('WWW-Authenticate', 'Basic realm="Access to protected resource"')
    .status(401)
    .send({ error: 'Unauthorized' });
  return;
});

const isCredentialsValid = (username: string, password: string): boolean => {
  for (const user of basicCredentials) {
    if (username === user.username && password === user.password) {
      return true;
    }
  }

  return false;
};

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});
