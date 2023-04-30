import { Matrix, Session } from '@prisma/client';
import bcrypt from 'bcryptjs';
import config from 'config';
import crypto from 'crypto';
import { createUser, signTokens } from '../../src/services/auth.service';
import { createMatrix } from '../../src/services/matrix.service';
import { createSession } from '../../src/services/session.service';
import { updateUser } from '../../src/services/user.service';

const defaultPassword = 'Password123';

const generateTestMatrices = async (
  count: number,
  creatorId: string
): Promise<Matrix[]> => {
  const matrices: Matrix[] = [];

  for (let i = 0; i < count; i++) {
    const matrix = await createMatrix({
      name: `Matrix${i}`,
      rows: 2,
      columns: 2,
      values: JSON.stringify([
        ['🐖', '🦍'],
        ['🐏', '🦬'],
      ]),
      creatorId,
    });
    matrices.push(matrix);
  }
  return matrices;
};

const generateTestSessions = async (matrices: Matrix[]): Promise<Session[]> => {
  const sessions: Session[] = [];

  for (let i = 0; i < matrices.length; i++) {
    const session = await createSession({
      name: `Session${i}`,
      matrixId: matrices[i].id,
      ownerId: matrices[i].creatorId,
    });

    sessions.push(session);
  }
  return sessions;
};

export const generateTestUsers = async (
  count: number,
  options?: { verifyEmail?: boolean; setPasswordResetToken?: boolean }
): Promise<any[]> => {
  const testUsers: any[] = [];
  const hashedPassword = await bcrypt.hash(
    defaultPassword,
    config.get<number>('hashSalt')
  );

  for (let i = 0; i < count; i++) {
    const emailId = crypto.randomBytes(32).toString('hex');

    const user = await createUser({
      firstName: 'Test',
      lastName: `User${i}`,
      email: `user${emailId}@test.com`,
      password: hashedPassword,
    });

    if (options?.verifyEmail) {
      await updateUser(
        { verificationCode: user.verificationCode },
        { verified: true }
      );
    }

    let resetToken;
    if (options?.setPasswordResetToken) {
      resetToken = crypto.randomBytes(32).toString('hex');
      const passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await updateUser(
        { id: user.id },
        {
          passwordResetToken,
          passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
        },
        { email: true }
      );
    }

    const { accessToken, refreshToken } = await signTokens(user);
    const matrices = await generateTestMatrices(3, user.id);
    const sessions = await generateTestSessions(matrices);

    console.log('helper=', matrices);

    const extendedUser = {
      ...user,
      password: defaultPassword,
      accessToken,
      refreshToken,
      resetToken,
      matrices,
      sessions,
    };

    testUsers.push(extendedUser);
  }
  return testUsers;
};
