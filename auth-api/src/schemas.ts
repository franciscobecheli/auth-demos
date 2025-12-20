export const opaqueLoginBodyJsonSchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['username', 'password'],
} as const;

export const schema = {
  body: opaqueLoginBodyJsonSchema,
};
