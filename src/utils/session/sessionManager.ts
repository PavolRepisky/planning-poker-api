import matrixService from '../../services/matrixService';
import sessionService from '../../services/sessionService';
import ClientSessionUserData from '../../types/session/ClientSessionUserData';
import ServerSessionUserData from '../../types/session/ServerSessionUserData';
import VoteCardData from '../../types/session/VoteCardData';

const activeSessions: Record<string, Record<string, ServerSessionUserData>> = {};

const isInBounds = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

const getSession = (
  sessionId: string
): Record<string, ServerSessionUserData> | null => {
  if (!activeSessions[sessionId]) {
    return null;
  }
  return activeSessions[sessionId];
};

const getSessionUser = (
  sessionId: string,
  socketSessionId: string
): ServerSessionUserData | null => {
  const session = getSession(sessionId);
  if (!session || !session[socketSessionId]) {
    return null;
  }
  return session[socketSessionId];
};

const createSession = async (sessionId: string): Promise<boolean> => {
  try {
    const session = await sessionService.findByHashId(sessionId);
    if (!session) {
      return false;
    }
    activeSessions[sessionId] = {};
    return true;
  } catch {
    return false;
  }
};

const addUserToSession = (
  socketId: string,
  sessionId: string,
  userData: ClientSessionUserData
): boolean => {
  const session = getSession(sessionId);
  const user = getSessionUser(sessionId, userData.socketSessionId);

  if (!session) {
    return false;
  }

  if (!user) {
    const { firstName, lastName, socketSessionId } = userData;
    session[socketSessionId] = {
      firstName,
      lastName,
      vote: null,
      sockets: [socketId],
    };
    return true;
  }

  user.sockets.push(socketId);
  return true;
};

const removeUserFromSession = (
  socketId: string,
  sessionId: string,
  socketSessionId: string
): boolean => {
  const session = getSession(sessionId);
  const user = getSessionUser(sessionId, socketSessionId);

  if (!session || !user || !user.sockets.includes(socketId)) {
    return false;
  }

  if (user.sockets.length === 1) {
    delete session[socketSessionId];
    return true;
  }

  session[socketSessionId].sockets = session[socketSessionId].sockets.filter(
    (socketId) => socketId !== socketId
  );
  return true;
};

const getSessionClientUsers = (
  sessionId: string
): ClientSessionUserData[] | null => {
  const session = getSession(sessionId);
  if (!session) {
    return null;
  }

  const clientUsers: ClientSessionUserData[] = [];

  for (const [socketSessionId, serverSessionUserData] of Object.entries(
    session
  )) {
    const { firstName, lastName, vote } = serverSessionUserData;
    clientUsers.push({
      firstName,
      lastName,
      vote,
      socketSessionId,
    });
  }

  return clientUsers;
};

const setUserVoteInSession = async (
  sessionId: string,
  socketSessionId: string,
  voteCardData: VoteCardData
): Promise<boolean> => {
  try {
    const session = await sessionService.findByHashId(sessionId);
    if (!session) {
      return false;
    }

    const matrix = await matrixService.findById(session.matrixId);
    if (
      !matrix ||
      !isInBounds(voteCardData.row, 0, matrix.rows) ||
      !isInBounds(voteCardData.column, 0, matrix.columns)
    ) {
      return false;
    }

    const votingSession = getSession(sessionId);
    const user = getSessionUser(sessionId, socketSessionId);

    if (!votingSession || !user) {
      return false;
    }

    user.vote = voteCardData;
    return true;
  } catch {
    return false;
  }
};

const sessionManager = {
  getSession,
  createSession,
  addUserToSession,
  getSessionClientUsers,
  removeUserFromSession,
  setUserVoteInSession,
  activeSessions
};

export default sessionManager;
