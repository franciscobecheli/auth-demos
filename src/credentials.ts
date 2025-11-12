import { verify } from 'argon2';

// Simple in memory credentials to simulate database

export interface BasicAuthCredentials {
  username: string;
  password: string;
}

// For demonstration purposes, the passwords have been hashed like they would before storing them in a production database. Argon2 was used to hash them and will be used to verify them by the authentication methods. Always use well established algorithms, never implement your own hashing algorithm.
export const basicCredentials: Array<BasicAuthCredentials> = [
  {
    username: 'user1',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$trBDsXSkXsWNpN1dbNqgFQ$NruY20F74W9DEJn0O+A+gQIbp10R0QYB1AaJOiNq4O0',
  },
  {
    username: 'user2',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$RfRWlmnK7wbw1yvuEwIJ3A$wll9MtIAY9Jyyi+mgJ97z6Sk7/ZcRcvwrxjfYOFbA/o',
  },
];

const verifyPassword = async (password: string, hashedPassword: string) => {
  return verify(hashedPassword, password);
};

export const isCredentialsValid = async (
  credentials: BasicAuthCredentials,
): Promise<boolean> => {
  for (const dbCredentials of basicCredentials) {
    if (dbCredentials.username === credentials.username) {
      const ok = await verifyPassword(
        credentials.password,
        dbCredentials.password,
      );

      if (ok) return true;
    }
  }
  return false;
};
