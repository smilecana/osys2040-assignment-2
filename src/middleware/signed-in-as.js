const PostgresUtil = require('../utils/PostgresUtil')

module.exports = async function(req, res, next) {
  const handle = req.cookies.handle

  const result = await PostgresUtil.pool.query(
    'SELECT * FROM app_users WHERE handle = $1::text',
    [ handle ])

  const foundUser = result.rows[0]
  if (foundUser) {
    res.locals.signedInAs = handle
  } else {
    res.locals.signedInAs = undefined
  }

  next()
}
