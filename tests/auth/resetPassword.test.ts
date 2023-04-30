import bcrypt from 'bcryptjs';
import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueUser } from '../../src/services/user.service';
import HttpCode from '../../src/types/HttpCode';
import ServerValidationError from '../../src/types/errors/ServerValidationError';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let testUser: any;

beforeAll(async () => {
  testUser = (
    await generateTestUsers(1, {
      verifyEmail: true,
      setPasswordResetToken: true,
    })
  )[0];
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: testUser.id,
    },
  });
});

describe('PATCH /reset-password/:resetToken', () => {
  describe('Given a request with a valid data', () => {
    it('should respond with a 200 status code and a message. Access token, refresh token and logged in cookies should be reset. User reset token and date should be also reset. A new user password should be set.', async () => {
      const requestBody = {
        password: testUser.password + 'new',
        confirmationPassword: testUser.password + 'new',
      };

      const response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}`)
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      const user = await findUniqueUser({ id: testUser.id });
      expect(user.passwordResetAt).toBeNull();
      expect(user.passwordResetToken).toBeNull();

      const cookies: string[] = response.headers['set-cookie'];
      expect(
        cookies.every((cookie) => {
          if (
            cookie.startsWith('access_token') ||
            cookie.startsWith('refresh_token') ||
            cookie.startsWith('logged_in')
          ) {
            const maxAge = Number(
              cookie
                .split('; ')
                .find((part) => part.startsWith('Max-Age'))
                ?.split('=')[1]
            );
            return maxAge === -1;
          }
          return true;
        })
      ).toBeTruthy();

      expect(
        await bcrypt.compare(requestBody.confirmationPassword, user.password)
      ).toBeTruthy();
    });
  });

  describe('Given a request with an invalid reset token', () => {
    it('should respond with a 404 status code and a message, if the reset token is missing or invalid', async () => {
      const requestBody = {
        password: testUser.password + 'new',
        confirmationPassword: testUser.password + 'new',
      };

      let response = await request(server)
        .patch('/reset-password/')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');

      response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}` + 'invalid')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with an invalid password data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the password is missing', async () => {
      const requestBodyWithoutPassword = {
        email: 'register@test10.com',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}`)
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

    it('should respond with a 400 status code, a message and a validation error, if the password is too weak', async () => {
      const requestBodyWithWeakPassword = {
        password: 'weakpassword',
        confirmationPassword: 'Password123',
      };

      const response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}`)
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
    });
  });

  describe('Given a request with an invalid confirmation password data', () => {
    it('should respond with a 400 status code, a message and a validation error, if the confirmation password is missing', async () => {
      const requestBodyWithoutConfirmationPassword = {
        password: testUser.password + 'new',
      };

      const response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}`)
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
    });

    it('should respond with a 400 status code, a message and a validation error, if the confirmation password does not match the password', async () => {
      const password = 'Password123';

      const requestBodyWithNonMatchingPasswords = {
        password: password,
        confirmationPassword: password + 'mismatch',
      };

      const response = await request(server)
        .patch(`/reset-password/${testUser.resetToken}`)
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
    });
  });
});
