import { ValidationError } from 'express-validator';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';

let testUser: TestUser;

beforeAll(async () => {
  testUser = await authHelper.generateTestUser(
    'Login',
    'Tester',
    'login@tester.com'
  );
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: testUser.id
    },
  });
});

describe('POST /login', () => {
  describe('Given a request with valid data', () => {
    it('should respond with a 200 status code, a message and a token', async () => {
      const requestBody = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await request(app).post('/login').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.token).toBe('string');
    });
  });

  describe('Given a request with invalid email data', () => {
    it('should respond with a 400 status code and a validation error, if the email is missing', async () => {
      const requestBodyWithoutEmail = {
        password: testUser.password,
      };

      const response = await request(app)
        .post('/login')
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
    });

    it('should respond with a 401 status code and a message, if the email is not in use', async () => {
      const requestBodyWithInvalidEmail = {
        email: 'unused@email.com',
        password: testUser.password,
      };

      const response = await request(app)
        .post('/login')
        .send(requestBodyWithInvalidEmail);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid password data', () => {
    it('should respond with a 400 status code and a validation error, if the password is missing', async () => {
      const requestBodyWithoutPassword = {
        email: testUser.email,
      };

      const response = await request(app)
        .post('/login')
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
    });

    it('should respond with a 401 status code and a message, if the password is invalid', async () => {
      const requestBodyWithInvalidPassword = {
        email: testUser.email,
        password: testUser.password + 'invalid',
      };

      const response = await request(app)
        .post('/login')
        .send(requestBodyWithInvalidPassword);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
