export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV,
    frontBaseUrl: process.env.FRONT_BASE_URL
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    ttl: process.env.JWT_TTL,
  },
});
