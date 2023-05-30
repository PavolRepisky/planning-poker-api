import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueMatrix } from '../../src/services/matrix.service';
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

describe('PATCH /matrices/:id', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 201 status code, a message and a matrix data. The matrix should be updated', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: matrix.name + '_updated',
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrix.name).toBe(requestBody.name);
      expect(response.body.data.matrix.rows).toBe(requestBody.rows);
      expect(response.body.data.matrix.columns).toBe(requestBody.columns);
      expect(response.body.data.matrix.values).toEqual(requestBody.values);
      expect(new Date(response.body.data.matrix.createdAt).toString()).toBe(
        new Date(matrix.createdAt as Date).toString()
      );

      const updatedMatrix = await findUniqueMatrix({ id: matrix.id });
      expect(updatedMatrix.name).toBe(requestBody.name);
      expect(updatedMatrix.rows).toBe(requestBody.rows);
      expect(updatedMatrix.columns).toBe(requestBody.columns);
      expect(updatedMatrix.values).toEqual(requestBody.values);
    });
  });

  describe('Given a request with an invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the acces token is invalid', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid matrix id', () => {
    it('should respond with a 404 status code and a message, if the user is not owner of the matrix', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      const matrix = user1.matrices[0];

      const requestBody = {
        name: matrix.name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user2.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 404 status code, if the matrix with the given id does not exist', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: matrix.name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${-1}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });

    it('should respond with a 404 status code, if the matrix id is not a number', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: matrix.name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/id`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });

  describe('Given a request with an invalid name data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
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

    it('should respond with a 400 status code and a validation error, if the name is too long', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'M'.repeat(85),
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
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

    it('should respond with a 400 status code and a validation error, if the name is already in use by another user matrix', async () => {
      const user = testUsers[0];
      const matrix1 = user.matrices[0];
      const matrix2 = user.matrices[1];

      const requestBody = {
        name: matrix2.name,
        rows: 2,
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix1.id}`)
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

  describe('Given a request with an invalid rows data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the rows are missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'Matrix7',
        columns: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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

    it('should respond with a 400 status code and a validation error, if the rows are bigger than man', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        values: [
          ['🐖', '🦍'],
          ['🐏', '🦬'],
        ],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

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
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
        values: [['🐖'], ['🐏', '🦬']],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const requestBody = {
        name: 'Matrix7',
        rows: 2,
        columns: 2,
        values: ['🐏', '🦬'],
      };

      const response = await request(server)
        .patch(`/matrices/${matrix.id}`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

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
    const user = testUsers[0];
    const matrix = user.matrices[0];

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
      .patch(`/matrices/${matrix.id}`)
      .send(requestBody)
      .set('Authorization', 'Bearer ' + user.accessToken);

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
    const user = testUsers[0];
    const matrix = user.matrices[0];

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
      .patch(`/matrices/${matrix.id}`)
      .send(requestBody)
      .set('Authorization', 'Bearer ' + user.accessToken);

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
