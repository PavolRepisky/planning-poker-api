import config from 'config';
import * as http from 'http';
import * as socketIO from 'socket.io';
import SocketSessionJoinUserData from '../../types/session/SocketSessionJoinUserData';
import SocketSessionUserVoteData from '../../types/session/SocketSessionUserVoteData';
import SocketVotingData from '../../types/session/SocketVotingData';
import { default as SocketSessionManager } from './SocketSessionManager';

class SocketServer {
  static instance: SocketServer;
  io: socketIO.Server;
  socketSessionManager = SocketSessionManager.getInstance();

  constructor(server: http.Server) {
    this.io = new socketIO.Server(server, {
      cors: {
        origin: [config.get<string>('origin')],
      },
    });
    this.setupConnection();
  }

  public static getInstance(server: http.Server): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(server);
    }
    return SocketServer.instance;
  }

  setupConnection() {
    this.io.on('connection', (socket: socketIO.Socket) => {
      this.setupJoinListener(socket);

      socket.on('disconnect', () => {
        socket.disconnect();
      });
    });
  }

  setupJoinListener(socket: socketIO.Socket) {
    socket.on(
      'joinSession',
      async (
        sessionHashId: string,
        userData: SocketSessionJoinUserData,
        callback
      ) => {
        const userCountBeforeJoin =
          this.socketSessionManager.getSessionUserCount(sessionHashId);

        const sessionJoined = await this.socketSessionManager.handlUserJoin(
          sessionHashId,
          userData,
          socket.id
        );

        if (sessionJoined) {
          socket.join(sessionHashId);

          this.setupCreateVotingListener(socket, sessionHashId);
          this.setupVoteListener(socket, sessionHashId, userData.connectionId);
          this.setupShowVotesListener(socket, sessionHashId);

          const userCountAfterJoin =
            this.socketSessionManager.getSessionUserCount(sessionHashId);
          if (userCountBeforeJoin < userCountAfterJoin) {
            this.emitSocketSessionData(sessionHashId);
          } else {
            const socketSessionData =
              this.socketSessionManager.getSessionData(sessionHashId);
            callback(socketSessionData);
          }
        }
      }
    );
  }

  setupCreateVotingListener(socket: socketIO.Socket, sessionHashId: string) {
    socket.on('createVoting', (votingData: SocketVotingData) => {
      this.socketSessionManager.handleCreateVoting(sessionHashId, votingData);
      this.emitSocketSessionData(sessionHashId);
    });
  }

  setupVoteListener(
    socket: socketIO.Socket,
    sessionHashId: string,
    userConnectionId: string
  ) {
    socket.on('vote', (voteData: SocketSessionUserVoteData) => {
      this.socketSessionManager.handleUserVote(
        sessionHashId,
        userConnectionId,
        voteData
      );
      this.emitSocketSessionData(sessionHashId);
    });
  }

  setupShowVotesListener(socket: socketIO.Socket, sessionHashId: string) {
    socket.on('showVotes', () => {
      const modeSwicthed =
        this.socketSessionManager.handleShowVotes(sessionHashId);
      if (modeSwicthed) {
        this.emitSocketSessionData(sessionHashId);
      }
    });
  }

  setupDisconnectListener(
    socket: socketIO.Socket,
    sessionHashId: string,
    userConnectionId: string
  ) {
    const userRemoved = this.socketSessionManager.handleUserDisconnect(
      sessionHashId,
      userConnectionId,
      socket.id
    );

    if (userRemoved) {
      this.emitSocketSessionData(sessionHashId);
    }
  }

  emitSocketSessionData(sessionHashId: string) {
    const socketSessionData =
      this.socketSessionManager.getSessionData(sessionHashId);

    this.io.to(sessionHashId).emit('sessionUpdate', socketSessionData);
  }
}

export default SocketServer;
