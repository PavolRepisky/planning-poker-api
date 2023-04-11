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
    'UpdatePassword',
    'Tester',
    'update-password@tester.com'
  );
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: testUser.id,
    },
  });
});

describe('PATCH /users/password', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code and a message', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBody = {
        password: testUser.password,
        newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBody = {
        password: testUser.password,
        newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBody = {
        password: testUser.password,
        newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid password data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the password is missing', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBodyWithoutPassword = {
        newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithoutPassword)
        .set('Authorization', 'Bearer ' + testUser.token);

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
      const newPassword = 'new' + testUser.password;

      const requestBodyWithInvalidPassword = {
        password: testUser.password + 'invalid',
        newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithInvalidPassword)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid new password data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the new password is missing', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBodyWithoutNewPassword = {
        password: testUser.password,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithoutNewPassword)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'newPassword'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the new password is weak', async () => {
      const newPassword = 'weaknewpassword';

      const requestBodyWithWeakNewPassword = {
        password: testUser.password,
        newPassword: newPassword,
        confirmationPassword: newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithWeakNewPassword)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'newPassword'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid confirmation password data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the confirmation password is missing', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBodyWithoutConfirmationPassowrd = {
        password: testUser.password,
        newPassword,
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithoutConfirmationPassowrd)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'confirmationPassword'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the confirmation password does not match the password', async () => {
      const newPassword = 'new' + testUser.password;

      const requestBodyWithNonMatchingPasswords = {
        password: testUser.password,
        newPassword,
        confirmationPassword: newPassword + 'mismatch',
      };

      const response = await request(app)
        .patch('/users/password')
        .send(requestBodyWithNonMatchingPasswords)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'confirmationPassword'
        )
      ).toBeTruthy();
    });
  });
});
