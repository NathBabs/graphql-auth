import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ArgonService } from './hashing/argon.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private hashingService: ArgonService,
  ) {}

  /**
   * Registers a new user with email and password.
   *
   * @param registerDto The registration credentials containing email and password
   * @returns An object containing the access token and user ID
   * @throws {UnauthorizedException} If the email is already registered
   */
  async register(registerDto: RegisterDto) {
    const { email, password, biometricKey } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password
    const hashedPassword = await this.hashingService.hash(password);

    // If biometricKey is provided, hash it as well
    let hashedBiometricKey: string | null = null;
    if (biometricKey) {
      hashedBiometricKey = await this.hashingService.hash(biometricKey);
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        biometricKey: hashedBiometricKey,
      },
    });

    // Generate JWT
    const accessToken = this.generateAccessToken(user.id, user.email);

    return {
      accessToken,
      userId: user.id,
    };
  }

  /**
   * Authenticates a user with email and password.
   *
   * @param loginDto The login credentials containing email and password
   * @returns An object containing the access token and user ID
   * @throws {UnauthorizedException} If the user is not found or credentials are invalid
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.hashingService.verify(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const accessToken = this.generateAccessToken(user.id, user.email);

    return {
      accessToken,
      userId: user.id,
    };
  }

  /**
   * Authenticates a user using a biometric key.
   *
   * @param biometricKey The unique biometric identifier for the user
   * @returns An object containing the access token and user ID
   * @throws {UnauthorizedException} If no user is found with the provided biometric key
   */
  async biometricLogin(biometricKey: string) {
    // Retrieve all users with a non-null biometricKey (should be at most one due to uniqueness)
    const users = await this.prisma.user.findMany({
      where: { biometricKey: { not: null } },
    });

    // Iterate through users to find a match via secure hash verification
    for (const user of users) {
      if (
        user.biometricKey &&
        (await this.hashingService.verify(user.biometricKey, biometricKey))
      ) {
        const accessToken = this.generateAccessToken(user.id, user.email);
        return { accessToken, userId: user.id };
      }
    }
    throw new UnauthorizedException('Invalid biometric key');
  }

  /**
   * Generates a JWT access token for a user.
   *
   * @param userId The unique identifier of the user
   * @param email The email address of the user
   * @returns A signed JWT access token valid for 2 hours
   */
  private generateAccessToken(userId: string, email: string) {
    return this.jwtService.sign(
      {
        sub: userId,
        email,
      },
      {
        expiresIn: '1h',
      },
    );
  }
}
