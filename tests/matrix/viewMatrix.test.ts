import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../src/app';
import authHelper from '../../src/helpers/authHelper';
import matrixHelper from '../../src/helpers/matrixHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';
import MatrixData from '../../src/types/matrix/MatrixData';
import prisma from '../../src/config/client';

dotenv.config();

let testData1: { user: TestUser; matrix: MatrixData };
let testData2: { user: TestUser; matrix: MatrixData };

beforeAll(async () => {
  const testUser1 = await authHelper.generateTestUser(
    'ViewMatrix',
    'Tester1',
    'view-matrix@tester1.com'
  );
  const testUser1Matrix = await matrixHelper.generateTestMatrix(
    'ViewMatrixUser1Matrix',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser1.id
  );

  const testUser2 = await authHelper.generateTestUser(
    'ViewMatrix',
    'Tester2',
    'view-matrix@tester2.com'
  );

  const testUser2Matrix = await matrixHelper.generateTestMatrix(
    'ViewMatrixUser2Matrix',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser2.id
  );

  testData1 = {
    user: testUser1,
    matrix: testUser1Matrix,
  };

  testData2 = {
    user: testUser2,
    matrix: testUser2Matrix,
  };
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [testData1.user.id, testData2.user.id],
      },
    },
  });
});

describe('GET /matrices/id', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code, a message and a matrix data', async () => {
      const response = await request(app)
        .get(`/matrices/${testData1.matrix.id}`)
        .set('Authorization', 'Bearer ' + testData1.user.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrix.name).toBe(testData1.matrix.name);
      expect(response.body.data.matrix.rows).toBe(testData1.matrix.rows);
      expect(response.body.data.matrix.columns).toBe(testData1.matrix.columns);
      expect(response.body.data.matrix.values).toEqual(testData1.matrix.values);
      expect(new Date(response.body.data.matrix.createdAt).toString()).toBe(
        new Date(testData1.matrix.createdAt).toString()
      );
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const response = await request(app).get(
        `/matrices/${testData1.matrix.id}`
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const response = await request(app)
        .get(`/matrices/${testData1.matrix.id}`)
        .set('Authorization', 'Bearer ' + testData1.user.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid matrix id', () => {
    it('should respond with a 401 status code and a message, if the user is not owner of the matrix', async () => {
      const response = await request(app)
        .get(`/matrices/${testData1.matrix.id}`)
        .set('Authorization', 'Bearer ' + testData2.user.token);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 404 status code, if the matrix with given id does not exist', async () => {
      const response = await request(app)
        .get(`/matrices/${-1}`)
        .set('Authorization', 'Bearer ' + testData2.user.token);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });

    it('should respond with a 404 status code, if the matrix id is not a number', async () => {
      const response = await request(app)
        .get(`/matrices/id`)
        .set('Authorization', 'Bearer ' + testData2.user.token);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});
