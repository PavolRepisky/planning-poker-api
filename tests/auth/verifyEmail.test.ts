import request from 'supertest';
import { server } from '../../src/app';
import { findUniqueUser } from '../../src/services/user.service';
import HttpCode from '../../src/types/HttpCode';
import prisma from '../../src/utils/prisma';
import { generateTestUsers } from '../helpers/testUser.helper';

let unverifiedUser: any;

beforeAll(async () => {
  unverifiedUser = (await generateTestUsers(1, { verifyEmail: false }))[0];
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: unverifiedUser.id,
    },
  });
});

describe('GET /verify-email/:verificationCode', () => {
  describe('Given a request with a valid verification code', () => {
    it('should respond with a 200 status code and a message. User should be verified.', async () => {
      const response = await request(server).get(
        `/verify-email/${unverifiedUser.verificationCode}`
      );
      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      const user = await findUniqueUser({ id: unverifiedUser.id });
      expect(user.verified).toBeTruthy();
    });
  });

  describe('Given a request with an invalid verification code', () => {
    it('should respond with a 404 status code and a message, if the verification code is missing or invalid', async () => {
      let response = await request(server).get(`/verify-email/`);
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');

      response = await request(server).get(
        `/verify-email/invalidVerificationCode`
      );
      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
