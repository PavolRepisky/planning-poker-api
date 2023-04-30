import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueUser } from '../../src/services/user.service';
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

describe('POST /forgot-password', () => {
  describe('Given a request with a valid data and verified user', () => {
    it('should respond with a 200 status code and a message. User reset token and date should be set.', async () => {
      const requestBody = {
        email: verifiedUser.email,
      };

      const response = await request(server)
        .post('/forgot-password')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      const user = await findUniqueUser({ id: verifiedUser.id });
      expect(user.passwordResetAt).toBeDefined();
      expect(user.passwordResetToken).toBeDefined();
    });
  });

  describe('Given a request with a valid data and unverified user', () => {
    it('should respond with a 401 status code and a message.', async () => {
      const requestBody = {
        email: unverifiedUser.email,
      };

      const response = await request(server)
        .post('/forgot-password')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid email data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the email is missing.', async () => {
      const response = await request(server).post('/forgot-password').send({});

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

    it('should respond with a 404 status code and a message and a validation error, if the email is not in use.', async () => {
      const requestBodyWithInvalidEmail = {
        email: 'unused@email.com',
      };

      const response = await request(server)
        .post('/forgot-password')
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
    });
  });
});
