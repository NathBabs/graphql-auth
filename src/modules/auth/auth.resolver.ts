import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './types/auth-response.type';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Mutation(() => AuthResponse)
  async biometricLogin(@Args('biometricKey') biometricKey: string) {
    return this.authService.biometricLogin(biometricKey);
  }
}
