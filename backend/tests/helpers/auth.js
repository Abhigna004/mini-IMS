import axios from 'axios';

const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;

const CREDS = {
  Super: { email: 'admin@mini-ims.local', password: 'Admin@123' },
  Staff: { email: 'staff@mini-ims.local', password: 'Staff@123' },
};

/** Returns a Bearer access token string for the given role */
export const getToken = async (role = 'Super') => {
  const { data } = await axios.post(`${BASE_URL}/auth/login`, CREDS[role]);
  return data.data.accessToken;
};
