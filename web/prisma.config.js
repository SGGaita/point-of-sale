require('dotenv').config();
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    directUrl: process.env.DIRECT_URL,
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
