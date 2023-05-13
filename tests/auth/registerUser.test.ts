import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueUser } from '../../src/services/user.service';
import HttpCode from '../../src/types/HttpCode';
import ServerValidationError from '../../src/types/errors/ServerValidationError';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let testUser: any;
const createdUsersIds: string[] = [];

beforeAll(async () => {
  testUser = (await generateTestUsers(1, { verifyEmail: true }))[0];
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [...createdUsersIds, testUser.id],
      },
    },
  });
});

describe('POST /register', () => {
  describe('Given a valid request', () => {
    it('should respond with a 201 status code, a message and a user id. A new user should be created.', async () => {
      const requestBody = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'register@test1.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.userId).toBe('string');

      const user = await findUniqueUser({ email: requestBody.email });
      expect(user).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with an invalid first name data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the first name is missing', async () => {
      const requestBodyWithoutFirstName = {
        lastName: 'Doe',
        email: 'register@test3.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithoutFirstName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'firstName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the first name is too long', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'J'.repeat(config.get<number>('maxNameLength') + 1),
        lastName: 'Doe',
        email: 'register@test4.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithTooLongFirstName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'firstName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with an invalid last name data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the last name is missing', async () => {
      const requestBodyWithoutLastName = {
        firstName: 'Joe',
        email: 'register@test5.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithoutLastName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'lastName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the last name is too long', async () => {
      const requestBodyWithTooLongLastName = {
        firstName: 'Joe',
        lastName: 'D'.repeat(config.get<number>('maxNameLength') + 1),
        email: 'register@test6.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithTooLongLastName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'lastName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with an invalid email data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the email is missing', async () => {
      const requestBodyWithoutEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithoutEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the email is invalid', async () => {
      const requestBodyWithInvalidEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'invalidEmail',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithInvalidEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the email is already in use', async () => {
      const requestBodyWithUsedEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: testUser.email,
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithUsedEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with an invalid password data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the password is missing', async () => {
      const requestBodyWithoutPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'register@test10.com',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithoutPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'password'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the password is too weak', async () => {
      const requestBodyWithWeakPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'register@test11.com',
        password: 'weakpassword',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithWeakPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'password'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with an invalid confirmation password data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the confirmation password is missing', async () => {
      const requestBodyWithoutConfirmationPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'register@test12.com',
        password: 'Password123',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithoutConfirmationPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) =>
            error.path === 'confirmationPassword'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code, a message and a validation error, if the confirmation password does not match the password', async () => {
      const password = 'Password123';

      const requestBodyWithNonMatchingPasswords = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'register@test12.com',
        password: password,
        confirmationPassword: password + 'mismatch',
      };

      const response = await request(server)
        .post('/register')
        .send(requestBodyWithNonMatchingPasswords);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) =>
            error.path === 'confirmationPassword'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });
});
