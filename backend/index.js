// START: Imports
require('dotenv').config()
const express = require('express')
const  morgan = require('morgan')
const cors = require('cors')
const fs = require('fs');
const Person = require('./models/person')

// HTTPS and SSL
const https = require('https');
const privateKey = fs.readFileSync(process.env.PRIV_KEY);
const certificate = fs.readFileSync(process.env.CERT);
const credentials = {key: privateKey, cert: certificate};
// END: Imports


const app = express();


// START: Middleware
// JSON middleware
app.use(express.json())
// CORS middleware
app.use(cors())

// Morgan middleware for logging - request body logged for POST *only*
morgan.token('body', (req, _) => JSON.stringify(req.body))
const morganLogPostBodyMiddleware = (req, res, next) => {
    let morganMiddleware
    if (req.method === "POST") {  // only execute if request method is POST
        morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms :body')
    } else {
        morganMiddleware = morgan('tiny')
    }
    morganMiddleware(req, res, next)

}
app.use(morganLogPostBodyMiddleware)
// END: Middleware


// START: Endpoints
// Get /info
app.get('/info', (req, res) => {
    Person.find({}).then(persons => {
        res.status(200).send('<div>' +
            `<p>Phonebook has info for ${persons.length} people</p>` +
            `<p>${Date().toString()}</p>` +
            '</div>')
    }).catch(_ => res.status(400).send("Error handling your request"))
})

// Get /api/persons
app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.status(200).json(persons)
    }).catch(_ => res.status(400).send("Error handling your request"))
})

// Get /api/persons/1
app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    }).catch(_ => res.status(400).send("Error handling your request"))
})

// Delete /api/persons/1  TODO
// app.delete('/api/persons/:id', (req, res) => {
//     let person = persons.find(p => p.id === req.params.id)
//     if (!person) {
//         res.status(404).send('No such person with id ' + req.params.id)
//     } else {
//         persons = persons.filter(p => p.id !== req.params.id)
//         res.status(200).json(person)
//     }
// })

// Post /api/persons
app.post('/api/persons', (req, res) => {
    if (!req.body.name) {
        res.status(400).send('No name specified.')
    } else if (!req.body.number) {
        res.status(400).send('No number specified.')
    } else {
        const person = new Person({
            name: req.body.name,
            number: req.body.number,
        })
        person.save().then(savedPerson => {
            res.json(savedPerson)
        }).catch(_ => res.status(400).send("Error handling your request"))
    }
})
// End: Endpoints


// 404 middleware
const unknownEndpointMiddleware = (request, response) => {response.status(404).send({ error: 'unknown endpoint' })}
app.use(unknownEndpointMiddleware)

// HTTPS server
const httpsServer = https.createServer(credentials, app);
const PORT = process.env.SERVER_PORT
const HOSTNAME = process.env.SERVER_HOSTNAME
httpsServer.listen(PORT, HOSTNAME, () => {
    console.log(`HTTPS server running on port ${PORT}`)
    console.log(`https://${HOSTNAME}:${PORT}`)
})
