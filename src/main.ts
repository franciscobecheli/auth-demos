import { fastifyHelmet } from '@fastify/helmet';
import { fastifyRateLimit } from '@fastify/rate-limit';
import { fastify } from 'fastify';
import { routes as basicAuthRoutes } from './basic/basic_auth.js';

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

app.register(basicAuthRoutes);

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});
