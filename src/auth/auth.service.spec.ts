import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let mockUsersRepository;

  const mockUser = {
    id: 'some-uuid',
    email: 'test@example.com',
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    mockUsersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should successfully create a new user', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersRepository.findOne.mockResolvedValue(null);
      mockUsersRepository.create.mockReturnValue(mockUser);
      mockUsersRepository.save.mockResolvedValue(mockUser);

      await expect(service.signUp(credentials)).resolves.not.toThrow();
    });

    it('should throw ConflictException if email exists', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.signUp(credentials)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signIn', () => {
    it('should return JWT token for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      const result = await service.signIn(credentials);
      expect(result.accessToken).toBeDefined();
      expect(result.accessToken).toBe('test-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(service.signIn(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
