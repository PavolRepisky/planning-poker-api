import { ValidationError } from 'express-validator';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import matrixHelper from '../../src/helpers/matrixHelper';
import sessionHelper from '../../src/helpers/sessionHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';
import MatrixData from '../../src/types/matrix/MatrixData';
import SessionInfo from '../../src/types/session/SessionData';

const testData: Array<{
  user: TestUser;
  matrix: MatrixData;
  session: SessionInfo;
}> = [];

beforeAll(async () => {
  for (let i = 0; i < 2; i++) {
    const user = await authHelper.generateTestUser(
      'CreateSession',
      `Tester${i}`,
      `create-session@tester${i}.com`
    );

    const matrix = await matrixHelper.generateTestMatrix(
      'CreateSession-TestMatrix',
      2,
      2,
      [
        ['🐖', '🦍'],
        ['🐏', '🦬'],
      ],
      user.id
    );

    const session = await sessionHelper.generateTestSession(
      'CreateSession-TestSession',
      matrix.id,
      user.id
    );

    testData.push({ user, matrix, session });
  }
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: testData.map((data) => data.user.id),
      },
    },
  });
});

describe('POST /sessions', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 201 status code, a message and a session data', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-1',
        matrixId: data.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.session.id).toBe('number');
      expect(typeof response.body.data.session.hashId).toBe('string');
      expect(response.body.data.session.name).toBe(requestBody.name);
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-2',
        matrixId: data.matrix.id,
      };

      const response = await request(app).post('/sessions').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-3',
        matrixId: data.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const data = testData[0];

      const requestBodyWithoutName = {
        matrixId: data.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBodyWithoutName)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'name'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the name is too short', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'T5',
        matrixId: data.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'name'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the name is too long', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-6'.repeat(30),
        matrixId: data.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'name'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid matrix id data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the matrix id is missing', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-7',
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the matrix id is not a number', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-8',
        matrixId: 'id',
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if matrix with the given matrix id does not exist', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateSession-Test-9',
        matrixId: -1,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'matrixId'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if user is not owner of the matrix given by its id', async () => {
      const data1 = testData[0];
      const data2 = testData[1];

      const requestBody = {
        name: 'CreateSession-Test-10',
        matrixId: data1.matrix.id,
      };

      const response = await request(app)
        .post('/sessions')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data2.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'matrixId'
        )
      ).toBeTruthy();
    });
  });
});
