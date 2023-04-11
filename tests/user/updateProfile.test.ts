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
    'UpdateProfile',
    'Tester',
    'update-profile@tester.com'
  );
});

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: testUser.id,
    },
  });
});

describe('PATCH /users/profile', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code, a message and a user data', async () => {
      const requestBody = {
        firstName: 'NewFirstName',
        lastName: 'NewLastName',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.firstName).toBe(requestBody.firstName);
      expect(response.body.data.user.lastName).toBe(requestBody.lastName);
      expect(response.body.data.user.email).toBe(testUser.email);
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const requestBody = {
        firstName: 'Joe',
        lastName: 'Doe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const requestBody = {
        firstName: 'Joe',
        lastName: 'Doe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid first name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the first name is missing', async () => {
      const requestBodyWithoutFirstName = {
        lastName: 'Doe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithoutFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the first name is too short', async () => {
      const requestBodyWithTooShortFirstName = {
        firstName: 'Jo',
        lastName: 'Doe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithTooShortFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if first name is too long', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'J'.repeat(65),
        lastName: 'Doe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithTooLongFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'firstName'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid last name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the last name is missing', async () => {
      const requestBodyWithoutFirstName = {
        firstName: 'Joe',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithoutFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the last name is too short', async () => {
      const requestBodyWithTooShortFirstName = {
        firstName: 'Joe',
        lastName: 'Do',
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithTooShortFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if last name is too long', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'Joe',
        lastName: 'D'.repeat(72),
      };

      const response = await request(app)
        .patch('/users/profile')
        .send(requestBodyWithTooLongFirstName)
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'lastName'
        )
      ).toBeTruthy();
    });
  });
});
