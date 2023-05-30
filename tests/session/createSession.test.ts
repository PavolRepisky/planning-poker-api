import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueSession } from '../../src/services/session.service';
import HttpCode from '../../src/types/HttpCode';
import ServerValidationError from '../../src/types/errors/ServerValidationError';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let testUsers: any;

beforeAll(async () => {
  testUsers = await generateTestUsers(2, { verifyEmail: true });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: testUsers.map((testUser: any) => testUser.id),
      },
    },
  });
});

describe('POST /sessions', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 201 status code, a message and a session data. A new session should be created.', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'CreateSession-Test-1',
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');

      expect(typeof response.body.data.session.id).toBe('number');
      expect(typeof response.body.data.session.hashId).toBe('string');
      expect(response.body.data.session.name).toBe(requestBody.name);

      const session = await findUniqueSession({
        id: response.body.data.session.id,
      });
      expect(session).toBeDefined();
    });
  });

  describe('Given a request with an invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'CreateSession-Test-2',
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'CreateSession-Test-3',
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with an invalid name data and a valid authorization', () => {
    it('should respond with a 400 status code, a message and a validation error, if the name is missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBodyWithoutName = {
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBodyWithoutName)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'name'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code, a message and a validation error, if the name is too long', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'S'.repeat(config.get<number>('maxNameLength') + 1),
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'name'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with an invalid matrix id data and a valid authorization', () => {
    it('should respond with a 400 status code, a message and a validation error, if the matrix id is missing', async () => {
      const user = testUsers[0];

      const requestBody = {
        name: 'CreateSession-Test-7',
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code, a message and a validation error, if the matrix id is not a number', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'CreateSession-Test-8',
        matrixId: 'notANumber',
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code, a message and a validation error, if matrix with the given matrix id does not exist', async () => {
      const user = testUsers[0];

      const requestBody = {
        name: 'CreateSession-Test-9',
        matrixId: -1,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code, a message and a validation error, if the user is not owner of the given matrix', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      const matrix = user1.matrices[0];

      const requestBody = {
        name: 'CreateSession-Test-10',
        matrixId: matrix.id,
      };

      const response = await request(server)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user2.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'matrixId'
        )
      ).toBeTruthy();
    });
  });
});
