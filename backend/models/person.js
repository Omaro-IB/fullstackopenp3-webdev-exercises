const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// Define the database URL to connect to.
// NOTE: I could not get a MongoDB atlas account working, so I have a MongoDB server running on the same cloud machine as my express server
const url = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.15'

// Wait for database to connect, logging an error if there is a problem
mongoose.connect(url)
// eslint-disable-next-line no-unused-vars
  .then(_ => {    console.log('connected to MongoDB')  })
  .catch(error => {    console.log('error connecting to MongoDB:', error.message)  })

// Schema
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d+/.test(v)
      },
      message: props => `${props.value} must be in the format [2-3 digits]-[1 or more digits]`
    },
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)