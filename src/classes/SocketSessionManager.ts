import { findUniqueSession } from '../services/session.service';
import SocketSessionData from '../types/socket/SocketSessionData';
import SocketSessionJoinUserData from '../types/socket/SocketSessionJoinUserData';
import SocketSessionUserData from '../types/socket/SocketSessionUserData';
import SocketSessionUserVoteData from '../types/socket/SocketSessionUserVoteData';
import SocketVotingData from '../types/socket/SocketVotingData';
import SocketSession from './SocketSession';

class SocketSessionManager {
  static instance: SocketSessionManager;
  private sessions: SocketSession[] = [];

  public static getInstance(): SocketSessionManager {
    if (!SocketSessionManager.instance) {
      SocketSessionManager.instance = new SocketSessionManager();
    }
    return SocketSessionManager.instance;
  }

  private getSession(hashId: string): SocketSession | null {
    return (
      this.sessions.find((session) => session.getHashId() === hashId) ?? null
    );
  }

  private async createSession(hashId: string): Promise<void> {
    const votingSession = await findUniqueSession({ hashId });
    if (!votingSession || this.getSession(hashId)) {
      return;
    }

    this.sessions.push(new SocketSession(hashId));

    return;
  }

  async handlUserJoin(
    hashId: string,
    userData: SocketSessionJoinUserData,
    socketId: string
  ): Promise<boolean> {
    await this.createSession(hashId);

    const socketSession = this.getSession(hashId);
    if (!socketSession) {
      return false;
    }

    socketSession.addUser(socketId, userData);
    return true;
  }

  handleUserDisconnect(
    sessionHashId: string,
    userConnectionId: string,
    socketId: string
  ): boolean {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return false;
    }
    return socketSession.removeUserIfDisconnected(userConnectionId, socketId);
  }

  handleUserVote(
    sessionHashId: string,
    userConnectionId: string,
    userVoteData: SocketSessionUserVoteData
  ): void {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return;
    }
    socketSession.setUserVote(userConnectionId, userVoteData);
  }

  handleShowVotes(sessionHashId: string): boolean {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return false;
    }
    return socketSession.showUsersVotes();
  }

  handleCreateVoting(
    sessionHashId: string,
    votingData: SocketVotingData
  ): void {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return;
    }
    socketSession.createVoting(votingData);
  }

  getSessionData(sessionHashId: string): SocketSessionData | null {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return null;
    }
    return socketSession.getData();
  }

  getUserData(
    sessionHashId: string,
    connectionId: string
  ): SocketSessionUserData | null {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return null;
    }
    return socketSession.getUserData(connectionId);
  }

  getUserVote(
    sessionHashId: string,
    connectionId: string
  ): SocketSessionUserVoteData | null {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return null;
    }
    return socketSession.getUserVote(connectionId);
  }

  getSessionUserCount(sessionHashId: string): number {
    const socketSession = this.getSession(sessionHashId);
    if (!socketSession) {
      return 0;
    }
    return socketSession.getUserCount();
  }
}

export default SocketSessionManager;
