import SocketSessionJoinUserData from '../../types/session/SocketSessionJoinUserData';
import SocketSessionUserData from '../../types/session/SocketSessionUserData';
import SocketSessionUserVoteData from '../../types/session/SocketSessionUserVoteData';

class SocketSessionUser {
  private firstName: string;
  private lastName: string;
  private connectionId: string;
  private vote?: SocketSessionUserVoteData;
  private socketIds: Set<string>;

  constructor(userData: SocketSessionJoinUserData, socketId: string) {
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.connectionId = userData.connectionId;
    this.socketIds = new Set(socketId);
  }

  getConnectionId() {
    return this.connectionId;
  }

  getData(includeVote: boolean): SocketSessionUserData {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      connectionId: this.connectionId,
      voted: this.vote !== undefined,
      vote: includeVote ? this.vote : undefined,
    };
  }

  addSocketId(socketId: string) {
    this.socketIds.add(socketId);
  }

  removeSocket(socketId: string) {
    this.socketIds.delete(socketId);
  }

  updateName(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }

  setVote(vote: SocketSessionUserVoteData) {
    if (
      this.vote &&
      this.vote.row === vote.row &&
      this.vote.column === vote.column
    ) {
      this.resetVote();
      return;
    }
    this.vote = vote;
  }

  resetVote() {
    this.vote = undefined;
  }

  hasDisconnected(): boolean {
    return this.socketIds.size === 0;
  }
}

export default SocketSessionUser;
