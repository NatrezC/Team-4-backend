const express = require('express')
const bodyParser = require('body-parser')
const dbConfig = require('./config/db.config')
const cors = require('cors')

const app = express()
require('dotenv').config()

// might refactor to limit image file size "({ limit: "30mb", extended...})""
// Parse requests of content type - application/json
app.use(bodyParser.json({limit: '50mb', extended: true}));

// Parse request of content type = application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(cors())

// Setup Mongoose
const db = require('./models/index.js')
const Role = db.role

const dbURI = process.env.MONGODB_URI || `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`

db.mongoose
  .connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
  })
  .then(() => {
      console.log('Successfully connected to MongoDB')
      initial()
  })
  .catch(err => {
      console.error('Connection error', err)
      process.exit
  })

//Import the routes we wrote
require('./routes/auth.routes')(app)
require('./routes/user.routes')(app)
require('./routes/post.routes')(app)
require('./routes/pet.routes')(app)

// Set the port, listen for request
const PORT = process.env.PORT || 8080
app.listen(PORT, ()=> {
    console.log(`Server running on ${PORT}`)
})

function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err)
          }
          console.log("added 'user' to roles collection");
        });
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err)
          }
          console.log("added 'admin' to roles collection")
        })
      }
    })
  }