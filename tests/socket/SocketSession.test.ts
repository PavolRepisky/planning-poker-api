import SocketSession from '../../src/classes/SocketSession';
import SocketSessionUserVoteData from '../../src/types/socket/SocketSessionUserVoteData';

let testUsersData: any = [];

beforeAll(() => {
  for (let i = 0; i < 3; i++) {
    testUsersData.push({
      userData: {
        firstName: 'Test',
        lastName: `User${i}`,
        connectionId: `${i}`,
      },
      socketId: `${i}`,
    });
  }
});

describe('Socket session', () => {
  describe('getHashId', () => {
    it('should return specified hash id', async () => {
      const hashId = 'ji9s0xiwednve8';
      const socketSession = new SocketSession(hashId);
      expect(socketSession.getHashId()).toBe(hashId);
    });
  });

  describe('getData', () => {
    it('should return correct default session data', async () => {
      const hashId = 'ftyf6776ghjfg6';
      const socketSession = new SocketSession(hashId);

      expect(socketSession.getData().voting).toBeUndefined();
      expect(socketSession.getData().showVotes).toBeFalsy();
      expect(socketSession.getData().users).toBeInstanceOf(Array);
      expect(socketSession.getData().users.length).toBe(0);
    });
  });

  describe('addUser, userCount', () => {
    it('should add users and return correct count', async () => {
      const hashId = 'cf6778cfx545eg80h';

      const socketSession = new SocketSession(hashId);
      expect(socketSession.getUserCount()).toBe(0);

      const user1 = testUsersData[0];
      const user2 = testUsersData[1];

      socketSession.addUser(user1.socketId, user1.userData);
      expect(socketSession.getUserCount()).toBe(1);

      socketSession.addUser(user2.socketId, user2.userData);
      expect(socketSession.getUserCount()).toBe(2);

      socketSession.addUser(user2.socketId, user2.userData);
      expect(socketSession.getUserCount()).toBe(2);

      expect(new Set(socketSession.getData().users)).toEqual(
        new Set([
          { ...user1.userData, voted: false },
          { ...user2.userData, voted: false },
        ])
      );
    });
  });

  describe('setUserVote, showUsersVotes, resetUsersVotes', () => {
    it('should set users votes and expose them in getData method and reset them', async () => {
      const hashId = 'cf6778cfx545eg80h';
      const socketSession = new SocketSession(hashId);
      socketSession.showUsersVotes();

      const user1 = testUsersData[0];
      const user2 = testUsersData[1];

      socketSession.addUser(user1.socketId, user1.userData);
      const user1Vote = { row: 4, column: 1 } as SocketSessionUserVoteData;
      socketSession.setUserVote(user1.userData.connectionId, user1Vote);

      socketSession.addUser(user2.socketId, user2.userData);
      const user2Vote = { row: 0, column: 0 } as SocketSessionUserVoteData;
      socketSession.setUserVote(user2.userData.connectionId, user2Vote);

      socketSession.setUserVote(
        user2.userData.connectionId + 'invalid',
        user2Vote
      );

      expect(new Set(socketSession.getData().users)).toEqual(
        new Set([
          { ...user1.userData, voted: true, vote: user1Vote },
          { ...user2.userData, voted: true, vote: user2Vote },
        ])
      );

      socketSession.setUserVote(user2.userData.connectionId, user2Vote);
      expect(new Set(socketSession.getData().users)).toEqual(
        new Set([
          { ...user1.userData, voted: true, vote: user1Vote },
          { ...user2.userData, voted: false, vote: undefined },
        ])
      );

      socketSession.resetUsersVotes();
      expect(new Set(socketSession.getData().users)).toEqual(
        new Set([
          { ...user1.userData, voted: false, vote: undefined },
          { ...user2.userData, voted: false, vote: undefined },
        ])
      );
    });
  });

  describe('createVoting', () => {
    it('should set new voting, hide votes and reset users votes', async () => {
      const hashId = 'h787sh8shx8w98x0090';
      const socketSession = new SocketSession(hashId);

      const user1 = testUsersData[0];
      const user1Vote = { row: 4, column: 1 } as SocketSessionUserVoteData;
      socketSession.addUser(user1.socketId, user1.userData);
      socketSession.setUserVote(user1.userData.connectionId, user1Vote);

      const user2 = testUsersData[1];
      const user2Vote = { row: 0, column: 0 } as SocketSessionUserVoteData;
      socketSession.addUser(user2.socketId, user2.userData);
      socketSession.setUserVote(user2.userData.connectionId, user2Vote);

      const newVoting = { name: 'New Voting', description: 'Description' };
      socketSession.createVoting(newVoting);

      socketSession.setUserVote(
        user2.userData.connectionId + 'invalid',
        user2Vote
      );

      expect(
        socketSession
          .getData()
          .users.every((user) => user.vote === undefined && !user.voted)
      ).toBeTruthy();
    });
  });

  describe('removeUserIfDisconnected', () => {
    it('it should return true if no user sockets left and remove the user from session, false otherwise', async () => {
      const hashId = 'h787sh8shx8w98x0090';
      const socketSession = new SocketSession(hashId);

      const user = testUsersData[0];
      socketSession.addUser(user.socketId, user.userData);
      socketSession.addUser(user.socketId + '2', user.userData);

      expect(
        socketSession.removeUserIfDisconnected(
          user.userData.connectionId,
          user.socketId + '2'
        )
      ).toBeFalsy();
      expect(
        socketSession.removeUserIfDisconnected(
          user.userData.connectionId,
          user.socketId
        )
      ).toBeDefined();

      expect(socketSession.getData().users.length).toBe(0);
    });
  });
});
