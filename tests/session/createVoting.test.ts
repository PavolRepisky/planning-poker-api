import config from 'config';
import request from 'supertest';
import { server } from '../../src/app';
import {
  findUniqueVoting,
  findVotings,
} from '../../src/services/session.service';
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

describe('POST /sessions/:hashId/voting', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 201 status code, a message and a voting data. A new voting should be created. All other votings of the given session should be closed', async () => {
      const user = testUsers[0];
      const session = user.sessions[0];

      const requestBody = {
        name: 'CreateVoting-Test-1',
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');

      expect(typeof response.body.data.voting.id).toBe('number');
      expect(response.body.data.voting.name).toBe(requestBody.name);
      expect(response.body.data.voting.description).toBe(
        requestBody.description
      );
      expect(response.body.data.voting.active).toBe(true);

      const voting = findUniqueVoting({ id: response.body.data.voting.id });
      expect(voting).toBeDefined();

      const sessionVotings = await findVotings({ sessionId: session.id });
      expect(
        sessionVotings.every(
          (voting: any) =>
            !voting.active || voting.id === response.body.data.voting.id
        )
      ).toBeTruthy();
    });

    it('should respond with a 201 status code, a message and a voting data, if description is not provided. A new voting should be created.', async () => {
      const user = testUsers[0];
      const session = user.sessions[0];

      const requestBody = {
        name: 'CreateVoting-Test-2',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');

      expect(typeof response.body.data.voting.id).toBe('number');
      expect(response.body.data.voting.name).toBe(requestBody.name);
      expect(response.body.data.voting.active).toBe(true);

      const voting = findUniqueVoting({ id: response.body.data.voting.id });
      expect(voting).toBeDefined();
    });
  });

  describe('Given a request with an invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const user = testUsers[0];
      const session = user.sessions[0];

      const requestBody = {
        name: 'CreateVoting-Test-4',
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the access token is invalid', async () => {
      const user = testUsers[0];
      const session = user.sessions[0];

      const requestBody = {
        name: 'CreateVoting-Test-5',
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 404 status code and a message, if the user is not owner of the session', async () => {
      const user1 = testUsers[0];
      const user2 = testUsers[1];
      const session = user1.sessions[0];

      const requestBody = {
        name: 'CreateVoting-Test-6',
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user2.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with an invalid name data and a valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const user = testUsers[0];
      const session = user.sessions[0];

      const requestBody = {
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
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
      const session = user.sessions[0];

      const requestBody = {
        name: 'C'.repeat(config.get<number>('maxNameLength') + 1),
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${session.hashId}/voting`)
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

  describe('Given a request with an invalid session hash id', () => {
    it('should respond with a 404 status code and a message', async () => {
      const user = testUsers[0];

      const requestBody = {
        name: 'CreateVoting-Test-10',
        description: 'Description',
      };

      const response = await request(server)
        .post(`/sessions/${'invalidHashId'}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + user.accessToken);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
