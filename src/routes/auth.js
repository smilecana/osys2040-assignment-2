var createError = require('http-errors')
var express = require('express')
var DataUtil = require('../utils/DataUtil')
var cookie = require('cookie')

var router = express.Router()

router.get('/sign-in', function(req, res, next) {
  res.render('sign-in')
})

router.post('/sign-in', function(req, res, next) {
  var handle = req.body.handle
  if (!handle) {
    return next(createError(400, 'missing handle'))
  }
  var password = req.body.password
  if (!password) {
    return next(createError(400, 'missing password'))
  }

  var users = DataUtil.readUsers()
  var user = users[handle]
  if (!user) {
    return next(createError(401, `no user with handle ${handle}`))
  }
  if (user.password !== password) {
    return next(createError(401, 'incorrect password'))
  }

  setSignedInCookie(res, handle)
  res.redirect('/')
})

function setSignedInCookie(res, handle) {
  res.setHeader('Set-Cookie', cookie.serialize('handle', handle, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // expire in 1 week
    sameSite: 'strict',
    path: '/',
  }))
}

router.get('/sign-out', function(req, res, next) {
  res.setHeader('Set-Cookie', cookie.serialize('handle', ' ', {
    httpOnly: true,
    maxAge: 0, // expire immediately
    path: '/',
  }))

  res.redirect('/')
})

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up')
})

router.post('/sign-up', (req, res, next) => {
  var userId = req.body.userId
  if (!userId) {
    return next(createError(400, 'missing userId'))
  }
  var password = req.body.password
  if (!password) {
    return next(createError(400, 'missing password'))
  }

  var users = DataUtil.readUsers()
  var user = users[userId]
  if (user) {
    return next(createError(409, `user with handle ${userId} already exists`))
  }

  users[userId] = req.body
  try {
    DataUtil.writeUsers(users)
  } catch (exception) {
    return next(createError(500, 'CANNOT WRITE TO users.json FILE ' + exception))
  }

  setSignedInCookie(res, userId)
  res.redirect('/')
})

module.exports = router
