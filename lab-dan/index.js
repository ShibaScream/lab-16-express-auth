'use strict'

const Express = require('express')
const router = Express.Router()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const app = Express()
const User = require('./model/user')
require('dotenv').load()
app.use(morgan('dev'))
app.use(cors())

const httpErrors = require('./lib/httpErrors')

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

mongoose.Promise = global.Promise
mongoose.connect(MONGO_URI).then(() => {
  // THIS WHOLE THING COULD BE A SEPARATE MODULE...BUT FOR NOW HERE IT IS
  console.log(`Mongo connected via ${MONGO_URI}`)
  // CLEAR THE DATABASE WHILE IN DEVELOPMENT
  User
    .remove()
    .then(() => {
      // THE DEFAULT ADMIN_PASS IS ONLY FOR DEVELOPMENT PURPOSES
      let adminSeed = new User({
        username: 'Admin',
        password: process.env.ADMIN_PASS
      })
      adminSeed
        .hashAndStorePassword(adminSeed.password)
        .then(user => user.save())
        .catch(err => console.error(err))
    })
    .catch(err => console.error(err))
})

require('./routes/user-routes')(router)

app.use(router)
app.use(httpErrors)

if(require.main === module) {
  app.listen(PORT, () => console.log(`server started on port ${PORT}`))
}

module.exports = app
