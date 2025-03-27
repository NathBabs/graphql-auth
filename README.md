# GraphQL Authentication API

A secure authentication API built with NestJS and GraphQL, featuring email/password and biometric authentication methods.

## Features

- User registration with email and password
- Email/password authentication
- Biometric authentication
- JWT-based authentication
- GraphQL API

## Prerequisites

- Node.js (v16 or later)
- Yarn package manager
- PostgreSQL database

## Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/NathBabs/graphql-auth
   cd graphql-auth
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```


3. Create a `.env` file in the root directory with the following variables:
   ```
   # Database configuration
   DB_USER=postgres_user
   DB_PASSWORD=secure_password
   DB_NAME=graphql_auth
   DB_HOST=localhost
   DB_PORT=54321
   
   # Database URL for Prisma (constructed from above variables)
   DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
   
   # JWT secret for authentication
   JWT_SECRET=your_secure_jwt_secret
   
   # API port
   PORT=3000
   ```

4. Start the PostgreSQL database using Docker:
   ```bash
   # This will use the variables from your .env file
   docker-compose up -d
   ```
5. Run database migrations:
   ```bash
   yarn prisma migrate dev 
   ```

6. Generate Prisma client:
   ```bash
   yarn prisma generate
   ```

## Running the Application

### Development Mode
```bash
yarn start:dev
```

### Production Mode
```bash
yarn build
yarn start:prod
```

The GraphQL API will be available at `http://localhost:3000/graphql`.

## API Documentation

### Authentication Endpoints

#### Register User
```graphql
mutation Register{
  register(registerInput: {
    email: "user@example.com",
    password: "StrongP@ssw0rd",
    biometricKey: "unique-biometric-identifier"
  }) {
    accessToken
    userId
  }
}
```

#### Login with Email/Password
```graphql
mutation Login {
  login(loginInput: {
    email: "user@example.com",
    password: "StrongP@ssw0rd"
  }) {
    accessToken
    userId
  }
}
```

#### Login with Biometric Key
```graphql
mutation BiometricLogin {
  biometricLogin(biometricKey: "unique-biometric-identifier") {
    accessToken
    userId
  }
}
```

### Health Check
```graphql
query {
  healthCheck
}
```

## Security Considerations

- Passwords are hashed using Argon2
- JWT tokens expire after 1 hour
- Biometric keys are stored as unique identifiers
- Error messages are designed to prevent information leakage

## Testing

### Running Tests
```bash
# Unit tests
yarn test
```

### GraphQL Schema

The GraphQL schema is available in the `src/schema.gql` file after running the application. You can also explore the API using the GraphQL Playground at `http://localhost:3000/graphql` when the application is running.

## Project Structure

```
src/
├── app.module.ts          # Main application module
├── main.ts                # Application entry point
├── schema.gql             # Generated GraphQL schema
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.resolver.ts
│   │   ├── auth.service.ts
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── hashing/       # Password hashing services
│   │   ├── strategies/    # JWT strategy
│   │   └── types/         # GraphQL types
│   └── prisma/            # Prisma database module
└── common/                # Shared utilities and filters
```

## License

[MIT](LICENSE)
