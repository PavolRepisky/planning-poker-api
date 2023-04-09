import VoteCardData from './VoteCardData';

interface ClientSessionUserData {
  firstName: string;
  lastName: string;
  vote: VoteCardData | null;
  socketSessionId: string;
}

export default ClientSessionUserData;
