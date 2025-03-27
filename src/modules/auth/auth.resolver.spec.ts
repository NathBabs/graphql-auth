import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ArgonService } from './hashing/argon.service';

// Mock dependencies for testing
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mockJwtToken'),
});

const mockHashingService = () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  verify: jest.fn().mockResolvedValue(true),
});

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let hashingService: ArgonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ArgonService, useFactory: mockHashingService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
