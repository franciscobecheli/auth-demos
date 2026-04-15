# Auth Demos

A comprehensive authentication demonstration project showcasing three different authentication methods using Fastify, TypeScript, and modern security practices.

## Overview

This project implements and demonstrates three popular authentication strategies:
1. **Basic Authentication** - Direct credential validation on each request
2. **Bearer Token (Opaque)** - Server-side token validation requiring database lookups
3. **Bearer Token (JWT)** - Self-contained tokens with cryptographic verification

## Authentication Methods

### 1. Basic Authentication

**How it works:**
- Client encodes credentials (username:password) in Base64
- Client sends credentials in the `Authorization: Basic <base64>` header
- Server validates credentials on every request
- Credentials are passed with each request

**Security Characteristics:**
- ✅ Simple to implement
- ✅ No session management required
- ❌ Credentials sent with every request (requires HTTPS)
- ❌ No logout mechanism
- ❌ Client must store credentials

**Endpoint:** `GET /basic/protected-resource`

**Example:**
```bash
# With username: user1, password: password1
curl -H "Authorization: Basic dXNlcjE6cGFzc3dvcmQx" http://localhost:3000/basic/protected-resource
```

### 2. Bearer Token (Opaque)

**How it works:**
- Client sends credentials (username/password) to `/bearer/opaque/login`
- Server validates credentials and generates a random opaque token
- Server stores token mapping to user in memory (or database in production)
- Client sends token in the `Authorization: Bearer <token>` header
- Server validates token by looking up user data on each request

**Security Characteristics:**
- ✅ Credentials only sent once (at login)
- ✅ Token is meaningless without server lookup
- ✅ Can be easily invalidated/revoked
- ✅ Better for stateless systems with centralized auth service
- ❌ Requires database lookup on every request
- ❌ Must implement expiration manually

**Endpoints:**
- `POST /bearer/opaque/login` - Login to get token
- `GET /bearer/opaque/protected-resource` - Access protected resource

**Example:**
```bash
# Login
curl -X POST http://localhost:3000/bearer/opaque/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password1"}'

# Response: {"access_token":"<token_here>"}

# Access protected resource
curl -H "Authorization: Bearer <token_here>" \
  http://localhost:3000/bearer/opaque/protected-resource
```

### 3. Bearer Token (JWT)

**How it works:**
- Client sends credentials to `/bearer/jwt/login`
- Server validates credentials and generates a signed JWT
- JWT contains user information (id, permissions) encoded in the token itself
- Client sends JWT in the `Authorization: Bearer <jwt>` header
- Server verifies JWT signature without database lookup

**Security Characteristics:**
- ✅ No database lookup needed for validation
- ✅ Credentials only sent once
- ✅ Self-contained token with user data
- ✅ Best for distributed systems and microservices
- ✅ Can set expiration with standard claims
- ❌ Token revocation is complex (logout requires blacklist)
- ❌ Cannot store sensitive information in token
- ❌ Token size is larger than opaque tokens

**Endpoints:**
- `POST /bearer/jwt/login` - Login to get JWT
- `GET /bearer/jwt/protected-resource` - Access protected resource

**Example:**
```bash
# Login
curl -X POST http://localhost:3000/bearer/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password1"}'

# Response: {"jwt":"<token_here>"}

# Access protected resource
curl -H "Authorization: Bearer <token_here>" \
  http://localhost:3000/bearer/jwt/protected-resource
```

## Installation

### Prerequisites
- Node.js 18+ 
- pnpm 10.26.1 or later

### Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd auth-demos
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Configure environment variables:**

Create a `.env` file in the `auth-api` directory:
```env
JWT_SECRET=your-secret-key-here
JWT_ISSUER=auth-demos
JWT_AUDIENCE=auth-demos-api
```

The server will use these values for JWT operations.

## Running the Project

### Development Mode

```bash
cd auth-api
pnpm dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Frontend Development

```bash
cd frontend
# Run using your preferred dev server (e.g., Live Server, Vite, etc.)
```

The frontend is configured to run on `http://localhost:5500` and make CORS requests to the API.

## Available Credentials

For testing, the following credentials are available (password hashed with Argon2):

| Username | Password   |
|----------|-----------|
| user1    | password1 |
| user2    | password2 |

## Security Features

The server implements several security best practices:

1. **Helmet** - Sets security HTTP headers
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `Strict-Transport-Security` (in production with HTTPS)

2. **Rate Limiting** - Restricts requests to 10 per minute per IP

3. **CORS** - Allows requests only from:
   - No origin (curl, Postman)
   - Frontend at `http://localhost:5500`

4. **Password Hashing** - Uses Argon2 for password verification

5. **JWT Verification** - Uses HS256 with HMAC-SHA256 for token signing

6. **HTTPS Check** - Enforces HTTPS in production (disabled for localhost development)

## API Endpoints

### Health Check
- `GET /` - Returns `{"hello":"world"}`

### Basic Authentication
- `GET /basic/protected-resource` - Requires Basic Auth header

### Opaque Bearer Token
- `POST /bearer/opaque/login` - Body: `{username, password}`
- `GET /bearer/opaque/protected-resource` - Requires Bearer token

### JWT Bearer Token
- `POST /bearer/jwt/login` - Body: `{username, password}`
- `GET /bearer/jwt/protected-resource` - Requires Bearer token

## Technologies Used

### Dependencies
- **fastify** - Fast and low overhead web framework
- **@fastify/helmet** - Security headers middleware
- **@fastify/cors** - CORS handling
- **@fastify/rate-limit** - Rate limiting middleware
- **jose** - JWT operations (sign/verify)
- **argon2** - Password hashing
- **dotenv** - Environment variable management

### Dev Dependencies
- **typescript** - Type safety
- **tsx** - TypeScript execution with watch mode
- **@biomejs/biome** - Code formatting and linting

## Testing the API

### Using cURL

```bash
# Basic Auth
curl -u user1:password1 http://localhost:3000/basic/protected-resource

# Opaque Token Login
curl -X POST http://localhost:3000/bearer/opaque/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password1"}'

# Opaque Token Protected Resource
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/bearer/opaque/protected-resource

# JWT Login
curl -X POST http://localhost:3000/bearer/jwt/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"password1"}'

# JWT Protected Resource
curl -H "Authorization: Bearer <jwt>" \
  http://localhost:3000/bearer/jwt/protected-resource
```