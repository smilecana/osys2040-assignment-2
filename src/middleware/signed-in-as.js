const DataUtil = require('../utils/DataUtil')

module.exports = function(req, res, next) {
  const userId = req.cookies.userId

  const users = DataUtil.readUsers()
  if (users[userId]) {
    res.locals.signedInAs = userId
  } else {
    res.locals.signedInAs = undefined
  }

  next()
}
