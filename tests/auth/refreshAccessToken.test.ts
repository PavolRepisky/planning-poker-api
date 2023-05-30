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

describe('GET /refresh', () => {
  describe('Given a request with a valid refresh token cookie', () => {
    it('should respond with a 200 status code, a message and new access token. Access token and logged in cookies should be set.', async () => {
      const response = await request(server)
        .get('/refresh')
        .set('Cookie', [`refresh_token=${testUser.refreshToken}`]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.accessToken).toBe('string');

      const cookies: string[] = response.headers['set-cookie'];

      expect(
        cookies.some((cookie) => cookie.startsWith('access_token'))
      ).toBeTruthy();
      expect(
        cookies.some((cookie) => cookie.startsWith('logged_in'))
      ).toBeTruthy();
    });
  });

  describe('Given a request with a invalid refresh token cookie', () => {
    it('should respond with a 400 status code and a message, if the refresh token cookie is missing', async () => {
      const response = await request(server).get('/refresh');

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 400 status code and a message, if the refresh token cookie is invalid', async () => {
      const response = await request(server)
        .get('/refresh')
        .set('Cookie', [`refresh_token=${testUser.refreshToken}` + 'invalid']);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
