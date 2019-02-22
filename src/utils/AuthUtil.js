const PostgresUtil = require('./PostgresUtil')

async function createUserTable() {
  return await PostgresUtil.pool.query(`CREATE TABLE AppUsers (
    handle        VARCHAR(100) PRIMARY KEY,
    passwordHash  VARCHAR(200)
  )`)
}

async function createUser(handle, password) {
  try {
    // TODO: convert password to passwordHash

    const result = await PostgresUtil.pool.query(
      'INSERT INTO AppUsers VALUES ($1::text, $2::text);',
      [
        handle, password
      ])

    return result
  } catch (exception) {
    if (exception.code === '42P01') {
      await createUserTable()
      return createUser(handle, password)
    } else {
      // unrecognized, don't handle here
      console.error(exception)
      throw exception
    }
  }
}

module.exports = {
  createUser: createUser,
}


    // const result = await PostgresUtil.pool.query('SELECT * FROM Users')
