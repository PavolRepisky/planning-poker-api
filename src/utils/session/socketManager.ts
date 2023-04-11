import * as http from 'http';
import * as socketIO from 'socket.io';
import ClientSessionUserData from '../../types/session/ClientSessionUserData';
import VoteCardData from '../../types/session/VoteCardData';
import sessionManager from './sessionManager';

let io: socketIO.Server;

const emitSessionUsers = (sessionId: string) => {
  const clientUsers = sessionManager.getSessionClientUsers(sessionId);
  if (!clientUsers) {
    return null;
  }
  io.to(sessionId).emit('users', clientUsers);
};

const joinSession = async (
  socket: socketIO.Socket,
  sessionId: string,
  userData: ClientSessionUserData
): Promise<boolean> => {
  if (!sessionManager.getSession(sessionId)) {
    if (!(await sessionManager.createSession(sessionId))) {
      return false;
    }
  }

  if (!sessionManager.addUserToSession(socket.id, sessionId, userData)) {
    return false;
  }

  socket.join(sessionId);
  emitSessionUsers(sessionId);
  return true;
};

export const setupSocketServer = (server: http.Server) => {
  io = new socketIO.Server(server, {
    cors: {
      origin: ['http://localhost:3001'],
    },
  });

  io.on('connection', (socket: socketIO.Socket) => {
    socket.on(
      'joinSession',
      async (sessionId: string, userData: ClientSessionUserData) => {
        const sessionJoined = await joinSession(socket, sessionId, userData);

        if (sessionJoined) {
          socket.on('vote', async (voteCardData: VoteCardData) => {
            const userVoted = await sessionManager.setUserVoteInSession(
              sessionId,
              userData.socketSessionId,
              voteCardData
            );

            if (userVoted) {
              emitSessionUsers(sessionId);
            }
          });

          socket.on('disconnect', () => {
            const userRemoved = sessionManager.removeUserFromSession(
              socket.id,
              sessionId,
              userData.socketSessionId
            );

            if (userRemoved) {
              emitSessionUsers(sessionId);
            }
          });
        }
      }
    );

    socket.on('disconnect', () => {
      socket.disconnect();
    });
  });
};
