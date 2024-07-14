import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

const mockUsersRepository = () => ({
  validateUserPassword: jest.fn(),
  createUser: jest.fn(),
  findOne: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository;
  let jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useFactory: mockJwtService },
        {
          provide: getRepositoryToken(UsersRepository),
          useFactory: mockUsersRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<UsersRepository>(
      getRepositoryToken(UsersRepository),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signUp', () => {
    it('should call userRepository.createUser', async () => {
      const mockAuthCredentialsDto: AuthCredentialsDto = {
        username: 'test',
        password: 'testPassword',
      };
      await authService.signUp(mockAuthCredentialsDto);
      expect(usersRepository.createUser).toHaveBeenCalledWith(
        mockAuthCredentialsDto,
      );
    });
  });

  describe('signIn', () => {
    it('should return a JWT token if credentials are valid', async () => {
      const mockAuthCredentialsDto: AuthCredentialsDto = {
        username: 'test',
        password: 'testPassword',
      };
      const salt = await bcrypt.genSalt();
      const user = {
        username: 'test',
        password: await bcrypt.hash('testPassword', salt),
      };
      usersRepository.validateUserPassword.mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockResolvedValue('testToken');

      const result = await authService.signIn(mockAuthCredentialsDto);
      expect(result).toEqual({ accessToken: 'testToken' });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'test' });
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const mockAuthCredentialsDto: AuthCredentialsDto = {
        username: 'test',
        password: 'testPassword',
      };
      usersRepository.validateUserPassword.mockResolvedValue(null);

      await expect(authService.signIn(mockAuthCredentialsDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
