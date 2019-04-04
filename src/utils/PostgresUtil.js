const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
  // user: 'postgres',
  // host: 'localhost',
  // database: 'postgres',
  // password: 'password',
  // port: '5432',

})

module.exports = {
  pool,
}
