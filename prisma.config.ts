import { defineConfig } from '@prisma/internals';

export default defineConfig({
  schema: './server/prisma/schema.prisma',
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
  },
});
