const express = require('express')
const  morgan = require('morgan')
const cors = require('cors')
const fs = require('fs');
const http = require('http');
const https = require('https');

const privateKey = fs.readFileSync('REDACTED');
const certificate = fs.readFileSync('REDACTED');
const credentials = {key: privateKey, cert: certificate};

const app = express();

// Persons list - statically defined
let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

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

// Get /info
app.get('/info', (req, res) => {
    res.status(200).send('<div>' +
        `<p>Phonebook has info for ${persons.length} people</p>` +
        `<p>${Date().toString()}</p>` +
        '</div>')
})

// Get /api/persons
app.get('/api/persons', (req, res) => {
    res.status(200).json(persons)
})

// Get /api/persons/1
app.get('/api/persons/:id', (req, res) => {
    let person = persons.find(p => p.id === req.params.id)
    if (!person) {
        res.status(404).send('No such person with id ' + req.params.id)
    } else {
        res.status(200).json(person)
    }
})

// Delete /api/persons/1
app.delete('/api/persons/:id', (req, res) => {
    let person = persons.find(p => p.id === req.params.id)
    if (!person) {
        res.status(404).send('No such person with id ' + req.params.id)
    } else {
        persons = persons.filter(p => p.id !== req.params.id)
        res.status(200).json(person)
    }
})

// Post /api/persons
app.post('/api/persons', (req, res) => {
    if (!req.body.name) {
        res.status(400).send('No name specified.')
    } else if (!req.body.number) {
        res.status(400).send('No number specified.')
    } else if (persons.find(p => p.name === req.body.name)) {
        res.status(400).send('Name already exists')
    } else {
        let id = Math.floor(Math.random() * 9999);
        let person = {
            "id": id.toString(),
            "name": req.body.name,
            "number": req.body.number
        }
        persons.push(person)
        res.status(200).json(person)
    }
})

// 404 middleware
const unknownEndpointMiddleware = (request, response) => {response.status(404).send({ error: 'unknown endpoint' })}
app.use(unknownEndpointMiddleware)

// const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

// const PORT_HTTP = 80
const PORT_HTTPS = 4441
const HOSTNAME = '10.0.0.208'
// httpServer.listen(PORT_HTTP, HOSTNAME, () => {
//     console.log(`HTTP server running on port ${PORT_HTTP}`)
//     console.log(`http://${HOSTNAME}:${PORT_HTTP}`)
// })
httpsServer.listen(PORT_HTTPS, HOSTNAME, () => {
    console.log(`HTTPS server running on port ${PORT_HTTPS}`)
    console.log(`https://${HOSTNAME}:${PORT_HTTPS}`)
})
