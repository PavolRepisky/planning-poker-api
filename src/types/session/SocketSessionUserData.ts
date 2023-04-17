import SocketVote from './SocketSessionUserVoteData';

interface SocketSessionUserData {
  firstName: string;
  lastName: string;
  voted: boolean;
  vote?: SocketVote;
  connectionId: string;
}

export default SocketSessionUserData;
