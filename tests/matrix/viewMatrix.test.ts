import request from 'supertest';
import { server } from '../../src/app';
import HttpCode from '../../src/types/HttpCode';
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

describe('GET /matrices/:id', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 200 status code, a message and a matrix data', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const response = await request(server)
        .get(`/matrices/${matrix.id}`)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrix.id).toBe(matrix.id);
      expect(response.body.data.matrix.name).toBe(matrix.name);
      expect(response.body.data.matrix.rows).toBe(matrix.rows);
      expect(response.body.data.matrix.columns).toBe(matrix.columns);
      expect(response.body.data.matrix.values).toEqual(matrix.values);
      expect(new Date(response.body.data.matrix.createdAt).toString()).toBe(
        new Date(matrix.createdAt).toString()
      );
    });
  });

  describe('Given a request with an invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const response = await request(server).get(`/matrices/${matrix.id}`);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const user = testUsers[0];
      const matrix = user.matrices[0];

      const response = await request(server)
        .get(`/matrices/${matrix.id}`)
        .set('Authorization', 'Bearer ' + user.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with an invalid matrix id', () => {
    it('should respond with a 404 status code and a message, if the user is not owner of the matrix', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      const matrix = user1.matrices[0];

      const response = await request(server)
        .get(`/matrices/${matrix.id}`)
        .set('Authorization', 'Bearer ' + user2.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 404 status code, if the matrix with given id does not exist', async () => {
      const user = testUsers[0];

      const response = await request(server)
        .get(`/matrices/${-1}`)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });

    it('should respond with a 404 status code, if the matrix id is not a number', async () => {
      const user = testUsers[0];

      const response = await request(server)
        .get(`/matrices/id`)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
    });
  });
});
