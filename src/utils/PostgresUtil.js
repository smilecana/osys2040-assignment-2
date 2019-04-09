const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
 // user: 'smilecana',
 // host: 'localhost',
 // database: 'chat',
 // password: 'password',
 // port: '5432',

})

module.exports = {
  pool,
}
