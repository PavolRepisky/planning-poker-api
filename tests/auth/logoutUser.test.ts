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

describe('GET /logout', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code and a message. Access token, refresh token and logged in cookies should reset', async () => {
      const response = await request(server)
        .get('/logout')
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      const cookies: string[] = response.headers['set-cookie'];

      expect(
        cookies.every((cookie) => {
          if (
            cookie.startsWith('access_token') ||
            cookie.startsWith('refresh_token') ||
            cookie.startsWith('logged_in')
          ) {
            const maxAge = Number(
              cookie
                .split('; ')
                .find((part) => part.startsWith('Max-Age'))
                ?.split('=')[1]
            );
            return maxAge === -1;
          }
          return true;
        })
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const response = await request(server).get('/logout');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const response = await request(server)
        .get('/logout')
        .set('Authorization', 'Bearer ' + testUser.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
