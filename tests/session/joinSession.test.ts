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
      'JoinSession',
      `Tester${i}`,
      `join-session@tester${i}.com`
    );

    const matrix = await matrixHelper.generateTestMatrix(
      'JoinSession-TestMatrix',
      2,
      2,
      [
        ['🐖', '🦍'],
        ['🐏', '🦬'],
      ],
      user.id
    );

    const session = await sessionHelper.generateTestSession(
      'JoinSession-TestSession',
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

describe('GET /sessions/:hashId', () => {
  describe('Given a request with valid data and valid authorization', () => {
    it('should respond with a 200 status code, a message, a session data and a matrix data', async () => {
      const data = testData[0];

      const response = await request(app)
        .get(`/sessions/${data.session.hashId}`)
        .set('Authorization', 'Bearer ' + data.user.token);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(typeof response.body.message).toBe('string');

      expect(typeof response.body.data.session.id).toBe('number');
      expect(typeof response.body.data.session.hashId).toBe('string');
      expect(response.body.data.session.name).toBe(data.session.name);
      expect(response.body.data.session.ownerId).toBe(data.user.id);

      expect(typeof response.body.data.matrix.id).toBe('number');
      expect(response.body.data.matrix.name).toBe(data.matrix.name);
      expect(response.body.data.matrix.rows).toBe(data.matrix.rows);
      expect(response.body.data.matrix.columns).toBe(data.matrix.columns);
      expect(response.body.data.matrix.values).toEqual(data.matrix.values);
      expect(new Date(response.body.data.matrix.createdAt).toString()).toBe(
        new Date(data.matrix.createdAt).toString()
      );
    });

    it('should add the session to user attended sesssions', async () => {
      const data = testData[0];

      const response = await request(app)
        .get(`/sessions/${data.session.hashId}`)
        .set('Authorization', 'Bearer ' + data.user.token);

      const attendedSessions = await sessionService.findUserAttendedSessions(
        data.user.id
      );

      expect(
        (await attendedSessions).find(
          (attendedSession) =>
            attendedSession.sessionHashId === data.session.hashId
        )
      ).toBeDefined();
    });
  });

  describe('Given a request with invalid session hash id', () => {
    it('should respond with a 404 status code and a message, if the session with the given hash id does not exist', async () => {
      const response = await request(app).get(`/sessions/invalidHashId`);

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(typeof response.body.message).toBe('string');
    });
  });
});
