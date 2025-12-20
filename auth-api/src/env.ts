import { configDotenv } from 'dotenv';
import { expand } from 'dotenv-expand';

interface EnvVars {
  JWT_SECRET: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
}

const rawEnv = {} as Partial<EnvVars>;
expand(configDotenv({ path: '.env', processEnv: rawEnv }));

export const env = rawEnv as EnvVars;
