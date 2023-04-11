import authService from '../services/authService';
import TestUser from '../types/auth/TestUser';
import signToken from '../utils/auth/signToken';

const defaultPassword = 'Password123';

const generateTestUser = async (
  firstName: string,
  lastName: string,
  email: string
): Promise<TestUser> => {
  const user = await authService.createUser(
    firstName,
    lastName,
    email,
    defaultPassword
  );

  const token = signToken(user.email, user.id);

  const userData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: defaultPassword,
    token,
  };

  return userData;
};

export default { generateTestUser };
