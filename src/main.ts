import Fastify from 'fastify';

const PORT = 3000;
const HOST = 'localhost';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', (_request, reply) => {
  reply.send({ hello: 'world' });
});

fastify.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});
