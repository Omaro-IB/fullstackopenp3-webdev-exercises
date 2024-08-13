// START: Imports
require('dotenv').config()
const express = require('express')
const  morgan = require('morgan')
const cors = require('cors')
const fs = require('fs')
const Person = require('./models/person')

// HTTPS and SSL
const https = require('https')
const privateKey = fs.readFileSync(process.env.PRIV_KEY)
const certificate = fs.readFileSync(process.env.CERT)
const credentials = { key: privateKey, cert: certificate }
// END: Imports


const app = express()


// START: Global Middleware
// JSON middleware
app.use(express.json())
// CORS middleware
app.use(cors())

// Morgan middleware for logging - request body logged for POST *only*
// eslint-disable-next-line no-unused-vars
morgan.token('body', (req, _) => JSON.stringify(req.body))
const morganLogPostBodyMiddleware = (req, res, next) => {
  let morganMiddleware
  if (req.method === 'POST') {  // only execute if request method is POST
    morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :body')
  } else {
    morganMiddleware = morgan('tiny')
  }
  morganMiddleware(req, res, next)

}
app.use(morganLogPostBodyMiddleware)
// END: Global Middleware


// START: Endpoints
// Get /info
app.get('/info', (req, res, next) => {
  Person.find({}).then(persons => {
    res.status(200).send('<div>' +
            `<p>Phonebook has info for ${persons.length} people</p>` +
            `<p>${Date().toString()}</p>` +
            '</div>')
  }).catch(err => next(err))
})

// Get /api/persons
app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.status(200).json(persons)
  }).catch(err => next(err))
})

// Get /api/persons/1
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).send({ error: 'person not found' })
    }
  }).catch(err => next(err))
})

// Delete /api/persons/1
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).send({ error: 'person not found' })
    }
  }).catch(err => next(err))
})

// Post /api/persons
app.post('/api/persons', (req, res, next) => {
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })
  person.save().then(savedPerson => {
    res.json(savedPerson)
  }).catch(err => next(err))
})

// Put /api/persons/1
app.put('/api/persons/:id', (req, res, next) => {
  const person = {
    name: req.body.content,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})
// End: Endpoints


// 404 middleware
const unknownEndpointMiddleware = (request, response) => {response.status(404).send({ error: 'unknown endpoint' })}
app.use(unknownEndpointMiddleware)

// Error handler middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

// HTTPS server
const httpsServer = https.createServer(credentials, app)
const PORT = process.env.SERVER_PORT
const HOSTNAME = process.env.SERVER_HOSTNAME
httpsServer.listen(PORT, HOSTNAME, () => {
  console.log(`HTTPS server running on port ${PORT}`)
  console.log(`https://${HOSTNAME}:${PORT}`)
})
