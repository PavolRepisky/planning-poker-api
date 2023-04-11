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

let testData1: { user: TestUser; matrices: MatrixData[] };
let testData2: { user: TestUser; matrices: MatrixData[] };

beforeAll(async () => {
  const testUser1 = await authHelper.generateTestUser(
    'UpdateMatrix',
    'Tester1',
    'update-matrix@tester1.com'
  );
  const testUser1Matrix1 = await matrixHelper.generateTestMatrix(
    'UpdateUser1Matrix1',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser1.id
  );
  const testUser1Matrix2 = await matrixHelper.generateTestMatrix(
    'UpdateUser1Matrix2',
    2,
    2,
    [
      ['🐖', '🦍'],
      ['🐏', '🦬'],
    ],
    testUser1.id
  );

  const testUser2 = await authHelper.generateTestUser(
    'UpdateMatrix',
    'Tester2',
    'update-matrix@tester2.com'
  );
  const testUser2Matrix1 = await matrixHelper.generateTestMatrix(
    'UpdateMatrixTest2',
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
    matrices: [testUser1Matrix1, testUser1Matrix2],
  };

  testData2 = {
    user: testUser2,
    matrices: [testUser2Matrix1],
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

describe('PATCH /matrices/id', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 201 status code, a message and a matrix data', async () => {
      const requestBody = {
        name: testData1.matrices[0].name + '_updated',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrix.name).toBe(requestBody.name);
      expect(response.body.data.matrix.rows).toBe(requestBody.rows);
      expect(response.body.data.matrix.columns).toBe(requestBody.columns);
      expect(response.body.data.matrix.values).toEqual(requestBody.values);
      expect(new Date(response.body.data.matrix.createdAt).toString()).toBe(
        new Date(testData1.matrices[0].createdAt as Date).toString()
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

      const response = await request(app)
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid matrix id', () => {
    it('should respond with a 401 status code and a message, if the user is not owner of the matrix', async () => {
      const requestBody = {
        name: testData1.matrices[0].name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData2.user.token);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 404 status code, if the matrix with given id does not exist', async () => {
      const requestBody = {
        name: testData1.matrices[0].name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .patch(`/matrices/${-1}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });

    it('should respond with a 404 status code, if the matrix id is not a number', async () => {
      const requestBody = {
        name: testData1.matrices[0].name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .patch(`/matrices/id`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        name: testData1.matrices[1].name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(app)
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
        .patch(`/matrices/${testData1.matrices[0].id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testData1.user.token);

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
      .patch(`/matrices/${testData1.matrices[0].id}`)
      .send(requestBody)
      .set('Authorization', 'Bearer ' + testData1.user.token);

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
