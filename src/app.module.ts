import { Module } from '@nestjs/common';
import { Modules } from './modules/modules';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { VoyagerController } from './modules/voyager/voyager.controller';

@Module({
  imports: [
    Modules, // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GraphQL configuration using Apollo Driver
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // auto-generate schema
      context: ({ req }) => ({ req }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
