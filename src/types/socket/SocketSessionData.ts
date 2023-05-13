import SocketSessionUserData from './SocketSessionUserData';
import SocketSessionUserVoteData from './SocketSessionUserVoteData';
import SocketVotingData from './SocketVotingData';

interface SocketSessionData {
  users: SocketSessionUserData[];
  voting?: SocketVotingData;
  votes?: Record<string, SocketSessionUserVoteData>
}

export default SocketSessionData;
