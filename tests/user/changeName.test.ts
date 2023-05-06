import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueUser } from '../../src/services/user.service';
import HttpCode from '../../src/types/HttpCode';
import ServerValidationError from '../../src/types/errors/ServerValidationError';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let testUser: any;

beforeAll(async () => {
  testUser = (await generateTestUsers(1, { verifyEmail: true }))[0];
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: testUser.id,
    },
  });
});

describe('PATCH /users/name', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code, a message and a user data. User first and last name should be changed.', async () => {
      const requestBody = {
        firstName: testUser.firstName + '_Updated',
        lastName: testUser.lastName + '_Updated',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.firstName).toBe(requestBody.firstName);
      expect(response.body.data.user.lastName).toBe(requestBody.lastName);
      expect(response.body.data.user.email).toBe(testUser.email);

      const user = await findUniqueUser({ id: testUser.id });
      expect(user.firstName).toBe(requestBody.firstName);
      expect(user.lastName).toBe(requestBody.lastName);
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const requestBody = {
        firstName: 'Joe',
        lastName: 'Doe',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const requestBody = {
        firstName: 'Joe',
        lastName: 'Doe',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid first name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the first name is missing', async () => {
      const requestBodyWithoutFirstName = {
        lastName: 'Doe',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBodyWithoutFirstName)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'firstName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the first name is too long.', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'J'.repeat(config.get<number>('maxNameLength') + 1),
        lastName: 'Doe',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBodyWithTooLongFirstName)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'firstName'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid last name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the last name is missing', async () => {
      const requestBodyWithoutFirstName = {
        firstName: 'Joe',
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBodyWithoutFirstName)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'lastName'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the last name is too long', async () => {
      const requestBodyWithTooLongFirstName = {
        firstName: 'Joe',
        lastName: 'D'.repeat(config.get<number>('maxNameLength') + 1),
      };

      const response = await request(server)
        .patch('/users/name')
        .send(requestBodyWithTooLongFirstName)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'lastName'
        )
      ).toBeTruthy();
    });
  });
});
