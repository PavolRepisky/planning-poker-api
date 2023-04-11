import { ValidationError } from 'express-validator';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';

let testUser: TestUser;
const createdUsersIds: string[] = [];

beforeAll(async () => {
  testUser = await authHelper.generateTestUser(
    'Register',
    'Tester',
    'register@tester.com'
  );
  createdUsersIds.push(testUser.id);
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: createdUsersIds,
      },
    },
  });
});

describe('POST /register', () => {
  describe('Given a request with valid data', () => {
    it('should respond with a 201 status code, a message and a user id', async () => {
      const requestBody = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@test1.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app).post('/register').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.userId).toBe('string');

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with invalid first name data', () => {
    it('should respond with a 400 status code and a validation error, if the first name is missing', async () => {
      const requestBodyWithoutFirstName = {
        lastName: 'Doe',
        email: 'johndoe@test2.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithoutFirstName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the first name is too short', async () => {
      const requestBodyWithTooShortFirstName = {
        firstName: 'Jo',
        lastName: 'Doe',
        email: 'johndoe@test3.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithTooShortFirstName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if first name is too long', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'J'.repeat(51),
        lastName: 'Doe',
        email: 'johndoe@test4.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithTooLongFirstName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with invalid last name data', () => {
    it('should respond with a 400 status code and a validation error, if the last name is missing', async () => {
      const requestBodyWithoutLastName = {
        firstName: 'Joe',
        email: 'johndoe@test5.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithoutLastName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the last name is too short', async () => {
      const requestBodyWithTooShortLastName = {
        firstName: 'Joe',
        lastName: 'Do',
        email: 'johndoe@test6.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithTooShortLastName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if last name is too long', async () => {
      const requestBodyWithTooLongLastName = {
        firstName: 'Joe',
        lastName: 'D'.repeat(58),
        email: 'johndoe@test7.com',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithTooLongLastName);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with invalid email data', () => {
    it('should respond with a 400 status code and a validation error, if the email is missing', async () => {
      const requestBodyWithoutEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithoutEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the email is invalid', async () => {
      const requestBodyWithInvalidEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'invalidEmail',
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithInvalidEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the email is already in use', async () => {
      const requestBodyWithUnavailableEmail = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: testUser.email,
        password: 'Password123',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithUnavailableEmail);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'email'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with invalid password data', () => {
    it('should respond with a 400 status code and a validation error, if the password is missing', async () => {
      const requestBodyWithoutPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'johndoe@test11.com',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithoutPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'password'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the password is weak', async () => {
      const requestBodyWithWeakPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'johndoe@test12.com',
        password: 'weakpassword',
        confirmationPassword: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithWeakPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'password'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });

  describe('Given a request with invalid confirmation password data', () => {
    it('should respond with a 400 status code and a validation error, if the confirmation password is missing', async () => {
      const requestBodyWithoutConfirmationPassword = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'johndoe@test13.com',
        password: 'Password123',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithoutConfirmationPassword);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'confirmationPassword'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });

    it('should respond with a 400 status code and a validation error, if the confirmation password does not match the password', async () => {
      const password = 'Password123';

      const requestBodyWithNonMatchingPasswords = {
        firstName: 'Joe',
        lastName: 'Doe',
        email: 'johndoe@test14.com',
        password: password,
        confirmationPassword: password + 'mismatch',
      };

      const response = await request(app)
        .post('/register')
        .send(requestBodyWithNonMatchingPasswords);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'confirmationPassword'
        )
      ).toBeTruthy();

      if (response.body.data?.userId) {
        createdUsersIds.push(response.body.data.userId);
      }
    });
  });
});
