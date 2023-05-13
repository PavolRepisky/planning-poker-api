import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import {
  findUniqueMatrix,
  transformName,
} from '../../src/services/matrix.service';
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

describe('POST /matrices', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 201 status code, a message and a matrix data. A new matrix should be created.', async () => {
      const requestBody = {
        name: testUser.matrices[0].name + 'unique',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.matrix.id).toBe('number');
      expect(response.body.data.matrix.name).toBe(
        transformName(requestBody.name)
      );
      expect(response.body.data.matrix.rows).toBe(requestBody.rows);
      expect(response.body.data.matrix.columns).toBe(requestBody.columns);
      expect(response.body.data.matrix.values).toEqual(requestBody.values);
      expect(new Date(response.body.data.matrix.createdAt)).toBeInstanceOf(
        Date
      );

      const matrix = findUniqueMatrix({ id: response.body.data.matrix.id });
      expect(matrix).toBeDefined();
    });
  });

  describe('Given a request with an invalid authorization', () => {
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const requestBody = {
        name: 'Matrix3',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with an invalid name data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const requestBody = {
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

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

    it('should respond with a 400 status code and a validation error, if the name is too long', async () => {
      const requestBody = {
        name: 'M'.repeat(config.get<number>('maxNameLength') + 1),
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

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

    it('should respond with a 400 status code and a validation error, if the name is already in use by the user', async () => {
      const requestBody = {
        name: testUser.matrices[0].name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

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

  describe('Given a request with an invalid rows data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the rows are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'rows'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the rows are lower than min', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: config.get<number>('matrixMinRows') - 1,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'rows'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the rows are bigger than max', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: config.get<number>('matrixMaxRows') + 1,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'rows'
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'rows'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with an invalid columns data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the columns are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'columns'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the columns are lower than min', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: config.get<number>('matrixMinColumns') - 1,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'columns'
        )
      ).toBeTruthy();
    });

    it('should respond with a 400 status code and a validation error, if the columns are bigger than max', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: config.get<number>('matrixMaxColumns') + 1,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'columns'
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'columns'
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with an invalid values data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the values are missing', async () => {
      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
      };

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'values'
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'values'
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'values'
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

      const response = await request(server)
        .post('/matrices')
        .send(requestBody)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(
        response.body.errors.some(
          (error: ServerValidationError) => error.path === 'values'
        )
      ).toBeTruthy();
    });
  });

  it('should respond with a 400 status code and a validation error, if the values are empty', async () => {
    const requestBody = {
      name: 'Matrix7',
      rows: 2,
      columns: 2,
      values: [
        ['🐖', ''],
        ['🦍', '🦍'],
      ],
    };

    const response = await request(server)
      .post('/matrices')
      .send(requestBody)
      .set('Authorization', 'Bearer ' + testUser.accessToken);

    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    expect(typeof response.body.message).toBe('string');
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(
      response.body.errors.some(
        (error: ServerValidationError) => error.path === 'values'
      )
    ).toBeTruthy();
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

    const response = await request(server)
      .post('/matrices')
      .send(requestBody)
      .set('Authorization', 'Bearer ' + testUser.accessToken);

    expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
    expect(typeof response.body.message).toBe('string');
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
    expect(
      response.body.errors.some(
        (error: ServerValidationError) => error.path === 'values'
      )
    ).toBeTruthy();
  });
});
