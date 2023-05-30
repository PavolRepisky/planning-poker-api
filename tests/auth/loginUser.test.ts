import request from 'supertest';
import { server } from '../../src/app';
import HttpCode from '../../src/types/HttpCode';
import ServerValidationError from '../../src/types/errors/ServerValidationError';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let verifiedUser: any;
let unverifiedUser: any;

beforeAll(async () => {
  verifiedUser = (await generateTestUsers(1, { verifyEmail: true }))[0];
  unverifiedUser = (await generateTestUsers(1, { verifyEmail: false }))[0];
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [verifiedUser.id, unverifiedUser.id],
      },
    },
  });
});

describe('POST /login', () => {
  describe('Given a request with valid data', () => {
    it('should respond with a 200 status code and a message. Access token, refresh token and logged in cookies should be set.', async () => {
      const requestBody = {
        email: verifiedUser.email,
        password: verifiedUser.password,
      };

      const response = await request(server).post('/login').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.accessToken).toBe('string');

      const cookies: string[] = response.headers['set-cookie'];

      expect(
        cookies.some((cookie) => cookie.startsWith('access_token'))
      ).toBeTruthy();
      expect(
        cookies.some((cookie) => cookie.startsWith('refresh_token'))
      ).toBeTruthy();
      expect(
        cookies.some((cookie) => cookie.startsWith('logged_in'))
      ).toBeTruthy();
    });
  });

  describe('Given a request with unverified user', () => {
    it('should respond with a 403 status code and a message.', async () => {
      const requestBody = {
        email: unverifiedUser.email,
        password: unverifiedUser.password,
      };

      const response = await request(server).post('/login').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid email data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the email is missing.', async () => {
      const requestBodyWithoutEmail = {
        password: verifiedUser.password,
      };

      const response = await request(server)
        .post('/login')
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
    });

    it('should respond with a 401 status code and a message, if the email is not in use.', async () => {
      const requestBodyWithInvalidEmail = {
        email: 'unused@email.com',
        password: verifiedUser.password,
      };

      const response = await request(server)
        .post('/login')
        .send(requestBodyWithInvalidEmail);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid password data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the password is missing,', async () => {
      const requestBodyWithoutPassword = {
        email: verifiedUser.email,
      };

      const response = await request(server)
        .post('/login')
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
    });

    it('should respond with a 401 status code and a message, if the password is invalid,', async () => {
      const requestBodyWithInvalidPassword = {
        email: verifiedUser.email,
        password: verifiedUser.password + 'invalid',
      };

      const response = await request(server)
        .post('/login')
        .send(requestBodyWithInvalidPassword);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
