import { fastifyCors } from "@fastify/cors";
import { fastifyHelmet } from "@fastify/helmet";
import { fastifyRateLimit } from "@fastify/rate-limit";
import { fastify } from "fastify";
import { routes as basicAuthRoutes } from "./basic/basic-auth.js";
import { routes as bearerTokenJwtRoutes } from "./bearer-token/jwt.js";
import { routes as bearerTokenOpaqueRoutes } from "./bearer-token/opaque.js";
import "./env.js";

const PORT = 3000;
const HOST = "localhost";

const app = fastify({
	logger: true,
});

await app.register(fastifyHelmet);
await app.register(fastifyRateLimit, {
	max: 10,
	timeWindow: "1 minute",
});
await app.register(fastifyCors, {
	origin: (origin, cb) => {
		// Allow no origin (like curl, Postman) and frontend at :5500
		if (!origin || origin === "http://localhost:5500") {
			cb(null, true);
			return;
		}
		cb(new Error("Not allowed by CORS"), false);
	},
	methods: ["GET", "POST", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
});

app.get("/", (_request, reply) => {
	reply.send({ hello: "world" });
});

app.register(basicAuthRoutes);
app.register(bearerTokenOpaqueRoutes);
app.register(bearerTokenJwtRoutes);

app.listen({ port: PORT, host: HOST }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	console.log(`Server is now listening on ${address}`);
});
