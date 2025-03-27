import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ArgonService } from './hashing/argon.service';
import { UnauthorizedException } from '@nestjs/common';

// Mock dependencies for testing
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
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

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let hashingService: ArgonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ArgonService, useFactory: mockHashingService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<ArgonService>(ArgonService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mock calls between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('Registration', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'StrongP@ssw0rd',
    };

    it('should successfully register a new user', async () => {
      // Mock no existing user
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock user creation
      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock JWT token generation
      (jwtService.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        accessToken: 'mock-token',
        userId: mockUser.id,
      });

      // Verify password was hashed
      expect(hashingService.hash).toHaveBeenCalledWith(registerDto.password);

      // Verify the user was created with the correct data
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: registerDto.email,
          password: 'hashedPassword', // This is the mocked return value from hashingService.hash
        }),
      });
    });

    it('should successfully register a user with biometric key', async () => {
      // Mock no existing user
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Create register DTO with biometric key
      const registerWithBiometricDto = {
        ...registerDto,
        biometricKey: 'unique-biometric-key',
      };

      // Mock user creation
      const mockUser = {
        id: 'user-id',
        email: registerWithBiometricDto.email,
        biometricKey: 'hashedBiometricKey',
      };
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Mock JWT token generation
      (jwtService.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.register(registerWithBiometricDto);

      expect(result).toEqual({
        accessToken: 'mock-token',
        userId: mockUser.id,
      });

      // Verify both password and biometric key were hashed
      expect(hashingService.hash).toHaveBeenCalledTimes(2);
      expect(hashingService.hash).toHaveBeenCalledWith(
        registerWithBiometricDto.password,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(
        registerWithBiometricDto.biometricKey,
      );

      // Verify the user was created with the correct data
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerWithBiometricDto.email,
          password: 'hashedPassword',
          biometricKey: 'hashedPassword', // This is the mocked return value from hashingService.hash
        },
      });
    });

    it('should throw an error if user already exists', async () => {
      // Mock existing user
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user-id',
        email: registerDto.email,
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'StrongP@ssw0rd',
    };

    it('should successfully login a user', async () => {
      // Mock user
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashedPassword',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (hashingService.verify as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockReturnValue('mock-token');
      const result = await authService.login(loginDto);
      expect(result).toEqual({
        accessToken: 'mock-token',
        userId: mockUser.id,
      });
    });

    it('should throw an error if user does not exist', async () => {
      // Mock no user
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if password is incorrect', async () => {
      // Mock user
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: 'hashedPassword',
      };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (hashingService.verify as jest.Mock).mockResolvedValue(false);
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('Biometric Login', () => {
    const biometricKey = 'unique-biometric-key';

    it('should login a user with a valid biometric key', async () => {
      const mockUsers = [
        { id: 'user-id', email: 'test@example.com', biometricKey: 'hashedKey' },
      ];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (hashingService.verify as jest.Mock).mockResolvedValue(true);

      const result = await authService.biometricLogin(biometricKey);

      expect(result).toEqual({
        accessToken: 'mockJwtToken',
        userId: 'user-id',
      });
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { biometricKey: { not: null } },
      });
      expect(hashingService.verify).toHaveBeenCalledWith(
        'hashedKey',
        biometricKey,
      );
    });

    it('should throw an error if no user matches the biometric key', async () => {
      const mockUsers = [
        { id: 'user-id', email: 'test@example.com', biometricKey: 'hashedKey' },
      ];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (hashingService.verify as jest.Mock).mockResolvedValue(false);

      await expect(authService.biometricLogin(biometricKey)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if no users with biometric keys exist', async () => {
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(authService.biometricLogin(biometricKey)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(hashingService.verify).not.toHaveBeenCalled();
    });

    it('should throw an error if no user matches the biometric key', async () => {
      // Mock users with biometric keys
      const mockUsers = [
        {
          id: 'user-id-1',
          email: 'test1@example.com',
          biometricKey: 'hashedBiometricKey1',
        },
        {
          id: 'user-id-2',
          email: 'test2@example.com',
          biometricKey: 'hashedBiometricKey2',
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      // Mock verification to always return false
      (hashingService.verify as jest.Mock).mockResolvedValue(false);

      await expect(authService.biometricLogin(biometricKey)).rejects.toThrow(
        UnauthorizedException,
      );

      // Verify findMany was called
      expect(prismaService.user.findMany).toHaveBeenCalled();

      // Verify verify was called for each user
      expect(hashingService.verify).toHaveBeenCalledTimes(2);
    });

    it('should throw an error if no users with biometric keys exist', async () => {
      // Mock no users with biometric keys
      (prismaService.user.findMany as jest.Mock).mockResolvedValue([]);

      await expect(authService.biometricLogin(biometricKey)).rejects.toThrow(
        UnauthorizedException,
      );

      // Verify findMany was called
      expect(prismaService.user.findMany).toHaveBeenCalled();

      // Verify verify was not called
      expect(hashingService.verify).not.toHaveBeenCalled();
    });
  });
});
