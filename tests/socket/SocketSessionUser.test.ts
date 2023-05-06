import SocketSessionUser from '../../src/classes/SocketSessionUser';
import SocketSessionJoinUserData from '../../src/types/socket/SocketSessionJoinUserData';
import SocketSessionUserVoteData from '../../src/types/socket/SocketSessionUserVoteData';

let testUser: SocketSessionUser;

const testJoinUserData: SocketSessionJoinUserData = {
  firstName: 'Joe',
  lastName: 'Doe',
  connectionId: 'kl2kl490d993i904dh4',
};
const testSocketId = '8980cke9d93i90dwq';

describe('Socket session user', () => {
  describe('getConnectionId', () => {
    it('should return specified connection id', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);
      expect(testUser.getConnectionId()).toBe(testJoinUserData.connectionId);
    });
  });

  describe('getData', () => {
    it('should return correct user data without vote, if asked to not include vote', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);

      expect(testUser.getData(false)).toEqual({
        ...testJoinUserData,
        voted: false,
      });

      const vote = { row: 1, column: 2 } as SocketSessionUserVoteData;
      testUser.setVote(vote);

      expect(testUser.getData(false)).toEqual({
        ...testJoinUserData,
        voted: true,
      });
    });

    it('should return correct user data with vote, if asked to include vote', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);

      expect(testUser.getData(true)).toEqual({
        ...testJoinUserData,
        voted: false,
      });

      const vote = { row: 1, column: 2 } as SocketSessionUserVoteData;
      testUser.setVote(vote);

      expect(testUser.getData(true)).toEqual({
        ...testJoinUserData,
        voted: true,
        vote: vote,
      });
    });
  });

  describe('updateName', () => {
    it('should update user name', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);

      const newFirstName = testJoinUserData.firstName + '_Updated';
      const newLastName = testJoinUserData.lastName + '_Updated';
      testUser.updateName(newFirstName, newLastName);

      expect(testUser.getData(false).firstName).toBe(newFirstName);
      expect(testUser.getData(false).lastName).toBe(newLastName);
    });
  });

  describe('setVote and resetVote', () => {
    it('should set and reset user vote', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);

      let newVote = { row: 0, column: 3 } as SocketSessionUserVoteData;
      testUser.setVote(newVote);
      expect(testUser.getData(true).vote).toEqual(newVote);

      testUser.setVote(newVote);
      expect(testUser.getData(true).vote).toBeUndefined();

      newVote = { row: 5, column: 2 } as SocketSessionUserVoteData;
      testUser.setVote(newVote);
      expect(testUser.getData(true).vote).toEqual(newVote);
    });
  });

  describe('addSocketId, removeSocketId, hasDisconnected', () => {
    it('should correctly add and remove socket ids. If all socket ids were removed user should considered disconnected', async () => {
      testUser = new SocketSessionUser(testJoinUserData, testSocketId);

      expect(testUser.hasDisconnected()).toBeFalsy();
      testUser.removeSocketId(testSocketId);
      expect(testUser.hasDisconnected()).toBeTruthy();

      const newSocketId1 = 'kdkkde094398ce';
      const newSocketId2 = 'kdkkde094398ce';

      testUser.addSocketId(newSocketId1);
      testUser.addSocketId(newSocketId2);
      expect(testUser.hasDisconnected()).toBeFalsy();

      testUser.removeSocketId('randomId');
      expect(testUser.hasDisconnected()).toBeFalsy();

      testUser.removeSocketId(newSocketId1);
      testUser.removeSocketId(newSocketId1);
      expect(testUser.hasDisconnected()).toBeTruthy();
    });
  });
});
