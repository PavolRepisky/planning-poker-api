import VoteCardData from './VoteCardData';

interface ServerSessionUserData {
  firstName: string;
  lastName: string;
  vote: VoteCardData | null;
  sockets: string[];
}

export default ServerSessionUserData;
