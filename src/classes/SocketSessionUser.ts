import SocketSessionJoinUserData from '../types/socket/SocketSessionJoinUserData';
import SocketSessionUserData from '../types/socket/SocketSessionUserData';

class SocketSessionUser {
  private firstName: string;
  private lastName: string;
  private connectionId: string;
  private voted = false;
  private socketIds = new Set();

  constructor(userData: SocketSessionJoinUserData, socketId: string) {
    this.firstName = userData.firstName;
    this.lastName = userData.lastName;
    this.connectionId = userData.connectionId;
    this.socketIds.add(socketId);
  }

  getConnectionId() {
    return this.connectionId;
  }

  getData(): SocketSessionUserData {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      connectionId: this.connectionId,
      voted: this.voted,
    };
  }

  addSocketId(socketId: string) {
    this.socketIds.add(socketId);
  }

  removeSocketId(socketId: string) {
    this.socketIds.delete(socketId);
  }

  setVoted(voted: boolean) {
    this.voted = voted;
  }

  hasDisconnected(): boolean {
    return this.socketIds.size === 0;
  }
}

export default SocketSessionUser;
