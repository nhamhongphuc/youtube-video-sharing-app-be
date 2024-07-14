import { Test } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

const mockUser = { username: 'test', password: 'testPassword' };

describe('UsersRepository', () => {
  let usersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: Repository<User>,
          useClass: Repository,
        },
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('createUser', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      usersRepository.create = jest.fn().mockReturnValue(mockUser);
      usersRepository.save = save;
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');
    });

    it('successfully creates a new user', async () => {
      save.mockResolvedValue(undefined);

      await expect(usersRepository.createUser(mockUser)).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' });
      await expect(usersRepository.createUser(mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws an internal server error exception for other errors', async () => {
      save.mockRejectedValue({ code: '12345' });
      await expect(usersRepository.createUser(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
