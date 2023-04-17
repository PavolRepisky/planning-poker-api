import SocketSessionUserData from './SocketSessionUserData';
import SocketVotingData from './SocketVotingData';

interface SocketSessionData {
  users: SocketSessionUserData[];
  voting?: SocketVotingData;
  showVotes: boolean;
}

export default SocketSessionData;
