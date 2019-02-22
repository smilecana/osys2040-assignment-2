const DataUtil = require('../utils/DataUtil')

module.exports = function(req, res, next) {
  const handle = req.cookies.handle

  const users = DataUtil.readUsers()
  if (users[handle]) {
    res.locals.signedInAs = handle
  } else {
    res.locals.signedInAs = undefined
  }

  next()
}
