import sessionService from '../services/sessionService';
import SessionData from '../types/session/SessionData';

const generateTestSession = async (
  name: string,
  matrixId: number,
  creatorId: string
) => {
  const session = await sessionService.create(name, matrixId, creatorId);

  return {
    id: session.id,
    hashId: session.hashId,
    name: session.name,
    ownerId: session.ownerId,
  } as SessionData;
};

export default { generateTestSession };
