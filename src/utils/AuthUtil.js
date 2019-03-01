const PostgresUtil = require('./PostgresUtil')
const bcrypt = require('bcrypt-nodejs')

async function createUserTable() {
  return await PostgresUtil.pool.query(`CREATE TABLE app_users (
    handle         VARCHAR(100) PRIMARY KEY,
    password_hash  VARCHAR(200)
  )`)
}

async function createUser(handle, password) {
  try {
    const passwordHash = bcrypt.hashSync(password)

    const result = await PostgresUtil.pool.query(
      'INSERT INTO app_users VALUES ($1::text, $2::text);',
      [
        handle, passwordHash
      ])

    return result
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createUserTable()
      return createUser(handle, password)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

module.exports = {
  createUser: createUser,
}


    // const result = await PostgresUtil.pool.query('SELECT * FROM Users')
