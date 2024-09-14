const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

morgan.token('data', function (request, response) {
    const person = request.body
    return JSON.stringify(person)
})
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": "1"
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": "2"
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": "3"
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": "4"
    }
]

app.post('/api/persons', (request, response) => {
    const body = request.body
    const notUnique = persons.find(person => person.name === body.name)
    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (notUnique){
        return response.status(400).json({
            error: 'name must be unique'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    const id = Math.floor(Math.random() * 10000)

    const person = {
        name: body.name,
        number: body.number,
        id: String(id)
    }

    persons = persons.concat(person)
    response.json(person)
})

app.get('/info', (request, response) => {
    const count = persons.length
    const date = new Date()

    response.send((`<p>Phonebook has info for ${count} people<br>${date}</p>`))
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})