import config from 'config';
import * as http from 'http';
import * as socketIO from 'socket.io';
import SocketSessionJoinUserData from '../types/socket/SocketSessionJoinUserData';
import SocketSessionUserVoteData from '../types/socket/SocketSessionUserVoteData';
import SocketVotingData from '../types/socket/SocketVotingData';
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
      this.setupGetUserListener(socket);
      this.setupJoinListener(socket);

      socket.on('disconnect', () => {
        socket.disconnect();
      });
    });
  }

  setupGetUserListener(socket: socketIO.Socket) {
    socket.on(
      'get_user',
      (sessionHashId: string, connectionId: string, callback) => {
        const userData = this.socketSessionManager.getUserData(
          sessionHashId,
          connectionId
        );
        callback(userData);
      }
    );
  }

  setupJoinListener(socket: socketIO.Socket) {
    socket.on(
      'join_session',
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
          socket.join(userData.connectionId);

          this.setupCreateVotingListener(socket, sessionHashId);
          this.setupVoteListener(socket, sessionHashId, userData.connectionId);
          this.setupShowVotesListener(socket, sessionHashId);
          this.setupDisconnectListener(
            socket,
            sessionHashId,
            userData.connectionId
          );

          const userCountAfterJoin =
            this.socketSessionManager.getSessionUserCount(sessionHashId);
          if (userCountBeforeJoin < userCountAfterJoin) {
            this.emitSocketSessionData(sessionHashId);
          } else {
            const socketSessionData =
              this.socketSessionManager.getSessionData(sessionHashId);
            const userVote = this.socketSessionManager.getUserVote(
              sessionHashId,
              userData.connectionId
            );
            callback({ sessionData: socketSessionData, userVote });
          }
        }
      }
    );
  }

  setupCreateVotingListener(socket: socketIO.Socket, sessionHashId: string) {
    socket.on('create_voting', (votingData: SocketVotingData) => {
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
      const userVote = this.socketSessionManager.getUserVote(sessionHashId, userConnectionId);
      this.emitSocketSessionData(sessionHashId);
      this.emitUserVote(userConnectionId, userVote);
    });
  }

  setupShowVotesListener(socket: socketIO.Socket, sessionHashId: string) {
    socket.on('show_votes', () => {
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
    socket.on('disconnect', () => {
      const userRemoved = this.socketSessionManager.handleUserDisconnect(
        sessionHashId,
        userConnectionId,
        socket.id
      );

      if (userRemoved) {
        this.emitSocketSessionData(sessionHashId);
      }
    });
  }

  emitSocketSessionData(sessionHashId: string) {
    const socketSessionData =
      this.socketSessionManager.getSessionData(sessionHashId);

    this.io.to(sessionHashId).emit('session_update', socketSessionData);
  }

  emitUserVote(connectionId: string, voteData: SocketSessionUserVoteData | null) {
    this.io.to(connectionId).emit('vote_update', voteData);
  }
}

export default SocketServer;
