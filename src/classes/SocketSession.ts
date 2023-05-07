import SocketSessionData from '../types/socket/SocketSessionData';
import SocketSessionJoinUserData from '../types/socket/SocketSessionJoinUserData';
import SocketSessionUserData from '../types/socket/SocketSessionUserData';
import SocketSessionUserVoteData from '../types/socket/SocketSessionUserVoteData';
import SocketVotingData from '../types/socket/SocketVotingData';
import SocketSessionUser from './SocketSessionUser';

class SocketSession {
  private hashId: string;
  private showVotes = false;
  private users: SocketSessionUser[] = [];
  private voting?: SocketVotingData;
  private votes: Record<string, SocketSessionUserVoteData> = {};

  constructor(hashId: string) {
    this.hashId = hashId;
  }

  private getUser(userConnectionId: string): SocketSessionUser | null {
    return (
      this.users.find((user) => user.getConnectionId() === userConnectionId) ??
      null
    );
  }

  private removeUser(userConnectionId: string): void {
    this.users = this.users.filter(
      (user) => user.getConnectionId() !== userConnectionId
    );
  }

  getHashId(): string {
    return this.hashId;
  }

  getData(): SocketSessionData {
    return {
      users: this.users.map((user) => user.getData()),
      voting: this.voting,
      votes: this.showVotes ? this.votes : undefined,
    };
  }

  getUserData(connectionId: string): SocketSessionUserData | null {
    const user = this.getUser(connectionId);
    if (!user) {
      return null;
    }
    return user.getData();
  }

  getUserVote(connectionId: string): SocketSessionUserVoteData | null {
    return this.votes[connectionId] ?? null;
  }

  addUser(socketId: string, userData: SocketSessionJoinUserData): void {
    const existingUser = this.getUser(userData.connectionId);
    if (existingUser) {
      existingUser.addSocketId(socketId);
      return;
    }
    this.users.push(new SocketSessionUser(userData, socketId));
  }

  getUserCount(): number {
    return this.users.length;
  }

  setUserVote(
    userConnectionId: string,
    userVoteData: SocketSessionUserVoteData
  ) {
    const user = this.getUser(userConnectionId);
    if (!user) {
      return;
    }
    const userOldVote = this.votes[userConnectionId];

    if (
      userOldVote &&
      userOldVote.row === userVoteData.row &&
      userOldVote.column === userVoteData.column
    ) {
      user.setVoted(false);
      delete this.votes[userConnectionId];
      return;
    }

    user.setVoted(true);
    this.votes[userConnectionId] = userVoteData;
  }

  removeUserIfDisconnected(
    userConnectionId: string,
    socketId: string
  ): boolean {
    const existingUser = this.getUser(userConnectionId);
    if (!existingUser) {
      return false;
    }

    existingUser.removeSocketId(socketId);

    if (existingUser.hasDisconnected()) {
      this.removeUser(userConnectionId);
      return true;
    }
    return false;
  }

  showUsersVotes() {
    if (!this.showVotes) {
      this.showVotes = true;
      return true;
    }
    return false;
  }

  createVoting(votingData: SocketVotingData) {
    this.voting = votingData;
    this.showVotes = false;
    this.resetUsersVotes();
  }

  resetUsersVotes() {
    this.users.forEach((user) => {
      user.setVoted(false);
    });
    this.votes = {};
  }
}

export default SocketSession;
