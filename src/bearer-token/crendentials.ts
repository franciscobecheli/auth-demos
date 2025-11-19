import type { BasicAuthCredential } from '../basic/credentials.js';

export interface BearerOpaqueCredential extends BasicAuthCredential {
  token: string | null;
}

export interface JWTUserData extends BasicAuthCredential {
  id: number;
  permissions: Array<string>;
}

export const bearerOpaqueCredentials: Array<BearerOpaqueCredential> = [
  {
    username: 'user1',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$trBDsXSkXsWNpN1dbNqgFQ$NruY20F74W9DEJn0O+A+gQIbp10R0QYB1AaJOiNq4O0',
    token: null,
  },
  {
    username: 'user2',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$RfRWlmnK7wbw1yvuEwIJ3A$wll9MtIAY9Jyyi+mgJ97z6Sk7/ZcRcvwrxjfYOFbA/o',
    token: null,
  },
];

export const jwtCredentials: Array<JWTUserData> = [
  {
    id: 1,
    permissions: ['create', 'delete'],
    username: 'user1',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$trBDsXSkXsWNpN1dbNqgFQ$NruY20F74W9DEJn0O+A+gQIbp10R0QYB1AaJOiNq4O0',
  },
  {
    id: 2,
    permissions: ['read'],
    username: 'user2',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$RfRWlmnK7wbw1yvuEwIJ3A$wll9MtIAY9Jyyi+mgJ97z6Sk7/ZcRcvwrxjfYOFbA/o',
  },
];
