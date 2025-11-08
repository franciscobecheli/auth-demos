// Simple in memory credentials to simulate database

interface BasicAuthCredentials {
  username: string;
  password: string;
}

export const basicCredentials: Array<BasicAuthCredentials> = [
  {
    username: 'user1',
    password: 'pwd1',
  },
  {
    username: 'user2',
    password: 'pwd2',
  },
];
