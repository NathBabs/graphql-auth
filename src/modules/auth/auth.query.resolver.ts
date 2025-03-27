import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AuthQueryResolver {
  @Query(() => String)
  healthCheck(): string {
    return 'GraphQL Auth API is running!';
  }
}
