const express = require('express')
const createError = require('http-errors')
const Chat = require('../model/chat')

const router = express.Router()

router.get('/chat', async function getMessages(req, res, next) {
  const messages = await Chat.getMessages()
  res.render('messages', { messages })
})

router.post('/chat/create-message', async function createMessage(req, res, next) {
  if (!res.locals.signedInAs) {
    return next(createError(401))
  }

  const message = req.body.message
  if (!message) {
    return next(createError(400, 'missing message'))
  }

  await Chat.createMessage(res.locals.signedInAs, {
    message: message,
  })

  res.redirect('/chat')
})

module.exports = router
