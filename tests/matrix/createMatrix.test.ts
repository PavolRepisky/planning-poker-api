import dotenv from 'dotenv';
import { ValidationError } from 'express-validator';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import matrixHelper from '../../src/helpers/matrixHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';
import MatrixData from '../../src/types/matrix/MatrixData';

dotenv.config();

let testUserAndMatrix: { user: TestUser; matrix: MatrixData };

beforeAll(async () => {
  const testUser = await authHelper.generateTestUser(
    'CreateMatrix',
    'Tester',
    'create-matrix@tester.com'
  );
  const testMatrix = await matrixHelper.generateTestMatrix(
    'CreateMatrixTest',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser.id
  );

  testUserAndMatrix = {
    user: testUser,
    matrix: testMatrix,
  };
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: testUserAndMatrix.user.id,
    },
  });
});

describe('POST /matrices', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 201 status code, a message and a matrix data', async () => {
      const requestBody = {
        name: 'Matrix1',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrix.name).toBe(requestBody.name);
      expect(response.body.data.matrix.rows).toBe(requestBody.rows);
      expect(response.body.data.matrix.columns).toBe(requestBody.columns);
      expect(response.body.data.matrix.values).toEqual(requestBody.values);
      expect(new Date(response.body.data.matrix.createdAt)).toBeInstanceOf(
        Date
      );
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const requestBody = {
        name: 'Matrix2',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app).post('/matrices').send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const requestBody = {
        name: 'Matrix3',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set(
          'Authorization',
          'Bearer ' + testUserAndMatrix.user.token + 'invalid'
        );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const requestBody = {
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

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
      const requestBody = {
        name: 'M5',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

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
      const requestBody = {
        name: 'M'.repeat(85),
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

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

    it('should respond with a 400 status code and a validation error, if the name is already in use', async () => {
      const requestBody = {
        name: testUserAndMatrix.matrix.name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

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

  describe('Given a request with invalid rows data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the rows are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'rows'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the rows are lower than 1', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 0,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'rows'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the rows are bigger than specified size', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: Number(process.env.MATRIX_MAX_ROWS) + 1,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'rows'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the rows are not a number', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 'notANumber',
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'rows'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid columns data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the columns are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'columns'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the columns are lower than 1', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 0,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'columns'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the columns are bigger than specified size', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: Number(process.env.MATRIX_MAX_COLUMNS) + 1,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'columns'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the columns are not a number', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 'notANumber',
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'columns'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid values data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the values are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'values'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the values do not match rows', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 3,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'values'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the values to not match columns', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
        values: [['🐖'], ['🐏', '🦬']],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'values'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the values are not a two dimensional array', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
        values: ['🐏', '🦬'],
      };

      const response = await request(app)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ValidationError) => error.param === 'values'
        )
      ).toBeTruthy();
    });
  });

  it('should respond with a 400 status code and a validation error, if the values are not unique', async () => {
    const requestBody = {
      name: 'Matrix7',
      rows: 2,
      columns: 2,
      values: [
        ['🐖', '🐖'],
        ['🦍', '🦍'],
      ],
    };

    const response = await request(app)
      .post('/matrices')
      .send(requestBody)
      .set('Authorization', 'Bearer ' + testUserAndMatrix.user.token);

    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    expect(typeof response.body.message).toBe('string');
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(
      response.body.errors.some(
        (error: ValidationError) => error.param === 'values'
      )
    ).toBeTruthy();
  });
});
