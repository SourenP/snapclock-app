config = {
  "AWS_ACCESS_KEY_ID": process.env.AWS_ACCESS_KEY_ID,
  "AWS_SECRET_ACCESS_KEY": process.env.AWS_SECRET_ACCESS_KEY,
  "S3_BUCKET": process.env.S3_BUCKET,
  "DATABASE_CONFIG": {
    user: process.env.DATABASE_USER, //env var: PGUSER
    database: process.env.DATABASE_NAME, //env var: PGDATABASE
    password: process.env.DATABASE_PASSWORD, //env var: PGPASSWORD
    host: 'localhost', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  }
}

module.exports = config;
