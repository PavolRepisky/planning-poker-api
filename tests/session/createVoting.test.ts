import { ValidationError } from 'express-validator';
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/client';
import authHelper from '../../src/helpers/authHelper';
import matrixHelper from '../../src/helpers/matrixHelper';
import sessionHelper from '../../src/helpers/sessionHelper';
import sessionService from '../../src/services/sessionService';
import TestUser from '../../src/types/auth/TestUser';
import HttpCode from '../../src/types/core/httpCode';
import MatrixData from '../../src/types/matrix/MatrixData';
import SessionInfo from '../../src/types/session/SessionData';

const testData: Array<{
  user: TestUser;
  matrix: MatrixData;
  session: SessionInfo;
}> = [];

beforeAll(async () => {
  for (let i = 0; i < 2; i++) {
    const user = await authHelper.generateTestUser(
      'CreateVoting',
      `Tester${i}`,
      `create-voting@tester${i}.com`
    );

    const matrix = await matrixHelper.generateTestMatrix(
      'CreateVoting-TestMatrix',
      2,
      2,
      [
        ['🐖', '🦍'],
        ['🐏', '🦬'],
      ],
      user.id
    );

    const session = await sessionHelper.generateTestSession(
      'CreateVoting-TestSession',
      matrix.id,
      user.id
    );

    testData.push({ user, matrix, session });
  }
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      id: {
        in: testData.map((data) => data.user.id),
      },
    },
  });
});

describe('POST /sessions/:hashId.voting', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 201 status code, a message and a voting data', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-1',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.voting.id).toBe('number');
      expect(response.body.data.voting.name).toBe(requestBody.name);
      expect(response.body.data.voting.description).toBe(
        requestBody.description
      );
      expect(response.body.data.voting.active).toBe(true);
    });

    it('should respond with a 201 status code, a message and a voting data, if description is not provided', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-2',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data.voting.id).toBe('number');
      expect(response.body.data.voting.name).toBe(requestBody.name);
      expect(response.body.data.voting.active).toBe(true);
    });

    it('should close all other votings of the given session', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-3',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      const sessionVotings = await sessionService.findVotingsBySessionId(
        data.session.id
      );

      expect(
        sessionVotings.every(
          (voting) =>
            !voting.active || voting.id === response.body.data.voting.id
        )
      ).toBeTruthy();
    });
  });

  describe('Given a request with invalid authorization', () => {
    it('should respond with a 401 status code and a message, if the authorization is missing', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-4',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the authorization token is invalid', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-5',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token + 'invalid');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });

    it('should respond with a 401 status code and a message, if the user is not owner of the session', async () => {
      const data1 = testData[0];
      const data2 = testData[1];

      const requestBody = {
        name: 'CreateVoting-Test-6',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data1.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data2.user.token);

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('Given a request with invalid name data and valid authorization', () => {
    it('should respond with a 400 status code and a validation error, if the name is missing', async () => {
      const data = testData[0];

      const requestBody = {
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

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
      const data = testData[0];

      const requestBody = {
        name: 'T8',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

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
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-9'.repeat(20),
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${data.session.hashId}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

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

  describe('Given a request with invalid session hash id', () => {
    it('should respond with a 404 status code and a message', async () => {
      const data = testData[0];

      const requestBody = {
        name: 'CreateVoting-Test-10',
        description: 'Description',
      };

      const response = await request(app)
        .post(`/sessions/${'invalidHashId'}/voting`)
        .send(requestBody)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
