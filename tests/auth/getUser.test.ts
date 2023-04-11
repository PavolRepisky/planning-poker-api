import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';

let testUser: TestUser;
const createdUsersIds: string[] = [];

beforeAll(async () => {
  testUser = await authHelper.generateTestUser(
    'GetUser',
    'Tester',
    'get-user@tester.com'
  );
  createdUsersIds.push(testUser.id);
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: createdUsersIds,
      },
    },
  });
});

describe('GET /me', () => {
  describe('Given a request with a valid authorization', () => {
    it('should respond with a 200 status code, a message and a user data', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer ' + testUser.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.firstName).toBe(testUser.firstName);
      expect(response.body.data.user.lastName).toBe(testUser.lastName);
      expect(response.body.data.user.email).toBe(testUser.email);
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const response = await request(app).get('/me');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', 'Bearer ' + testUser.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
