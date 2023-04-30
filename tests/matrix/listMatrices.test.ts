import request from 'supertest';
import { server } from '../../src/app';
import HttpCode from '../../src/types/HttpCode';
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

describe('GET /matrices', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 200 status code, a message and a matrices array', async () => {
      const response = await request(server)
        .get('/matrices')
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.matrices).toBeInstanceOf(Array);
      expect(response.body.data.matrices.length).toBe(testUser.matrices.length);

      for (let i = 0; i < testUser.matrices.length; i++) {
        const testMatrix = testUser.matrices.find(
          (matrix: any) => matrix.id == response.body.data.matrices[i].id
        );

        expect(testMatrix).toBeDefined();

        expect(response.body.data.matrices[i].name).toBe(testMatrix.name);
        expect(response.body.data.matrices[i].rows).toBe(testMatrix.rows);
        expect(response.body.data.matrices[i].columns).toBe(testMatrix.columns);
        expect(response.body.data.matrices[i].values).toEqual(
          testMatrix.values
        );
        expect(
          new Date(response.body.data.matrices[i].createdAt).toString()
        ).toBe(new Date(testMatrix.createdAt).toString());
      }
    });
  });

  describe('Given a request with an invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const response = await request(server).get('/matrices');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const response = await request(server)
        .get('/matrices')
        .set('Authorization', 'Bearer ' + testUser.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
