// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      // Extract JWT from Authorization header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Prevent token expiration bypass
      ignoreExpiration: false,

      // Secret key from environment
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Validates the JWT payload and retrieves the associated user
   * @param payload JWT payload containing user identification
   * @returns Validated user object
   */
  async validate(payload: IJwtPayload) {
    // Destructure payload
    const { sub: userId } = payload;

    // Find user in database
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
      },
    });

    // Throw unauthorized if no user found
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
