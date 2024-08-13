const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

// Define the database URL to connect to.
// NOTE: I could not get a MongoDB atlas account working, so I have a MongoDB server running on the same cloud machine as my express server
const mongoDB = process.env.MONGODB_URI

// Wait for database to connect, logging an error if there is a problem
const promise = mongoose.connect(mongoDB)
promise.catch((err) => console.log(err))

// Define schema
const Person = mongoose.model('Person', new mongoose.Schema({
  name: String,
  number: String,
}))

// Get arguments
if (process.argv.length<3) {
  // Display database
  Person.find({}).then(results => {
    results.forEach(r => {console.log(r)})
    mongoose.connection.close()
  })
} else {
  if (process.argv.length !== 4) {console.log('Usage: mongo.js [name] [number]'); process.exit(1)}
  // Add person and number
  const person = new Person({
    name: process.argv[2],
    number: process.argv[3],
  })
  // eslint-disable-next-line no-unused-vars
  person.save().then(_ => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}


