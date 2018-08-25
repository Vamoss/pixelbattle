// config.js file
require('dotenv').config();

module.exports = {
    db: process.env.DB_DATABASE,
    driver: "rethinkdbdash",
    pool: true,
    servers: [
      { host: process.env.DB_HOST, port: process.env.DB_PORT }
    ],
    rethinkdb: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        db: process.env.DB_DATABASE,
        user: process.env.DB_ADMIN_USERNAME,
        password: process.env.DB_ADMIN_PASSWORD,
        table: process.env.DB_TABLE
    },
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: false
  }