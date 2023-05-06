import SocketSessionData from '../types/socket/SocketSessionData';
import SocketSessionJoinUserData from '../types/socket/SocketSessionJoinUserData';
import SocketSessionUserVoteData from '../types/socket/SocketSessionUserVoteData';
import SocketVotingData from '../types/socket/SocketVotingData';
import SocketSessionUser from './SocketSessionUser';

class SocketSession {
  private showVotes = false;
  private users: SocketSessionUser[];
  private hashId: string;
  private voting?: SocketVotingData;

  constructor(hashId: string) {
    this.hashId = hashId;
    this.users = [];
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
      users: this.users.map((user) => user.getData(this.showVotes)),
      voting: this.voting,
      showVotes: this.showVotes,
    };
  }

  addUser(socketId: string, userData: SocketSessionJoinUserData): void {
    const existingUser = this.getUser(userData.connectionId);
    if (existingUser) {
      existingUser.updateName(userData.firstName, userData.lastName);
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
    const existingUser = this.getUser(userConnectionId);
    if (existingUser) {
      existingUser.setVote(userVoteData);
    }
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
      user.resetVote();
    });
  }
}

export default SocketSession;
