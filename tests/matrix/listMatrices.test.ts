import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import matrixHelper from '../../src/helpers/matrixHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';
import MatrixData from '../../src/types/matrix/MatrixData';

dotenv.config();

let testUserWithMultipleMatrices: { user: TestUser; matrices: MatrixData[] };
let testUserWithoutMatrices: { user: TestUser; matrices: MatrixData[] };

beforeAll(async () => {
  const testUser1 = await authHelper.generateTestUser(
    'ListMatrices',
    'Tester1',
    'list-matrices@tester1.com'
  );
  const testUser1Matrix1 = await matrixHelper.generateTestMatrix(
    'ListMatricesUser1Matrix1',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser1.id
  );
  const testUser1Matrix2 = await matrixHelper.generateTestMatrix(
    'ListMatricesUser1Matrix2',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser1.id
  );

  const testUser2 = await authHelper.generateTestUser(
    'ListMatrices',
    'Tester2',
    'list-matrices@tester2.com'
  );

  testUserWithMultipleMatrices = {
    user: testUser1,
    matrices: [testUser1Matrix1, testUser1Matrix2],
  };

  testUserWithoutMatrices = {
    user: testUser2,
    matrices: [],
  };
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          testUserWithMultipleMatrices.user.id,
          testUserWithoutMatrices.user.id,
        ],
      },
    },
  });
});

describe('GET /matrices', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code, a message and a matrices data', async () => {
      const response = await request(app)
        .get('/matrices')
        .set(
          'Authorization',
          'Bearer ' + testUserWithMultipleMatrices.user.token
        );

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrices).toBeInstanceOf(Array);
      expect(response.body.data.matrices.length).toBe(
        testUserWithMultipleMatrices.matrices.length
      );

      for (let i = 0; i < testUserWithMultipleMatrices.matrices.length; i++) {
        expect(response.body.data.matrices[i].name).toBe(
          testUserWithMultipleMatrices.matrices[i].name
        );
        expect(response.body.data.matrices[i].rows).toBe(
          testUserWithMultipleMatrices.matrices[i].rows
        );
        expect(response.body.data.matrices[i].columns).toBe(
          testUserWithMultipleMatrices.matrices[i].columns
        );
        expect(response.body.data.matrices[i].values).toEqual(
          testUserWithMultipleMatrices.matrices[i].values
        );
        expect(
          new Date(response.body.data.matrices[i].createdAt).toString()
        ).toBe(
          new Date(
            testUserWithMultipleMatrices.matrices[i].createdAt
          ).toString()
        );
      }
    });

    it('should respond with a 200 status code, a message and an empty array, if the user has no matrices', async () => {
      const response = await request(app)
        .get('/matrices')
        .set('Authorization', 'Bearer ' + testUserWithoutMatrices.user.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrices).toBeInstanceOf(Array);
      expect(response.body.data.matrices.length).toBe(0);
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const response = await request(app).get('/matrices');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const response = await request(app)
        .get('/matrices')
        .set(
          'Authorization',
          'Bearer ' + testUserWithMultipleMatrices.user.token + 'invalid'
        );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
