const express = require('express')
const createError = require('http-errors')
const DataUtil = require('../utils/DataUtil')
const PostgresUtil = require('../utils/PostgresUtil')

const router = express.Router()

async function createRoomTable() {
  return await PostgresUtil.pool.query(`CREATE TABLE rooms (
    name        VARCHAR(200) PRIMARY KEY,
    created_by  VARCHAR(200) REFERENCES app_users(handle),
    data        JSONB
  )`)
}

router.get('/', async function getRooms(req, res, next) {
  try {
    const result = await PostgresUtil.pool.query(
      'SELECT * FROM rooms;')

    const rooms = result.rows
    const roomIds = rooms.map(function(room) { return room.room_id })

    res.render('rooms', { rooms, roomIds })
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createRoomTable()
      return getRooms(req, res, next)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      next(exception)
    }
  }
})

router.post('/create-room', async function createRoom(req, res, next) {
  if (!res.locals.signedInAs) {
    return next(createError(401))
  }

  const roomName = req.body.roomName
  if (!roomName) {
    return next(createError(400, 'missing roomName'))
  }

  try {
    const result = await PostgresUtil.pool.query(
      'INSERT INTO rooms (created_by, name, data) VALUES ($1::text, $2::text, $3::jsonb);',
      [
        res.locals.signedInAs,
        roomName,
        {
          description: req.body.roomDescription,
        },
      ])

    res.redirect(`/chat/${roomName}`)
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createRoomTable()
      return createRoom(req, res, next)
    } else if (exception.code === '23505') {
      throw new Error(`Room ${roomName} already exists`)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
})

router.get('/:roomName', async function(req, res, next) {
  const roomName = req.params.roomName
  if (!roomName) {
    return next(createError(400, 'missing roomName'))
  }

  try {
    const result = await PostgresUtil.pool.query(
      'SELECT * FROM rooms WHERE name = $1::text;',
      [ roomName ])

    const room = result.rows[0]
    if (!room) {
      return next(createError(404, `no room with id ${roomName} exists`))
    }

    res.render('room', { room })
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createRoomTable()
      return getRooms(req, res, next)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      next(exception)
    }
  }
})

router.post('/:roomId/create-message', function(req, res, next) {
  const roomId = req.params.roomId
  if (!roomId) {
    return next(createError(400, 'missing roomId'))
  }

  const message = req.body.message
  if (!message) {
    return next(createError(400, 'missing message'))
  }

  const rooms = DataUtil.readRooms()
  const room = rooms[roomId]
  if (!room) {
    return next(createError(404, `no room with id ${roomId} exists`))
  }

  room.messages.push({
    createdBy: res.locals.signedInAs,
    createdAt: new Date(),
    updatedBy: res.locals.signedInAs,
    updatedAt: new Date(),

    message,
  })
  DataUtil.writeRooms(rooms)

  res.redirect(`/chat/${roomId}`)
})

module.exports = router
