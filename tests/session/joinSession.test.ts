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

describe('GET /sessions/:hashId', () => {
  describe('Given a request with a valid data and a valid authorization', () => {
    it('should respond with a 200 status code, a message, a session and matrix data', async () => {
      const matrix = testUser.matrices[0];
      const session = testUser.sessions[0];

      const response = await request(server)
        .get(`/sessions/${session.hashId}`)
        .set('Authorization', 'Bearer ' + testUser.accessToken);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      expect(response.body.data.session.id).toBe(session.id);
      expect(response.body.data.session.hashId).toBe(session.hashId);
      expect(response.body.data.session.name).toBe(session.name);
      expect(response.body.data.session.matrixId).toBe(session.matrixId);

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

  describe('Given a request with a valid data and no authorization', () => {
    it('should respond with a 200 status code, a message, a session and matrix data', async () => {
      const matrix = testUser.matrices[0];
      const session = testUser.sessions[0];

      const response = await request(server).get(`/sessions/${session.hashId}`);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      expect(response.body.data.session.id).toBe(session.id);
      expect(response.body.data.session.hashId).toBe(session.hashId);
      expect(response.body.data.session.name).toBe(session.name);
      expect(response.body.data.session.matrixId).toBe(session.matrixId);

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

  describe('Given a request with an invalid session hash id', () => {
    it('should respond with a 404 status code and a message, if the session with the given hash id does not exist', async () => {
      const response = await request(server).get(`/sessions/invalidHashId`);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
