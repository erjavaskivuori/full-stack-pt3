const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
const Person = require('./models/person')

morgan.token('data', function (request, response) {
  const person = request.body;
  return JSON.stringify(person);
});
app.use(express.json());
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data'),
);
app.use(cors());
app.use(express.static('dist'));

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status(400).json({ error: 'name missing' })
  }

  if (body.number === undefined) {
    return response.status(400).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.get('/api/info', async (request, response) => {
  const count = await Person.countDocuments({});
  const date = new Date();

  response.send(`<p>Phonebook has info for ${count} people<br>${date}</p>`);
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', async (request, response) => {
  const id = request.params.id;
  await Person.findByIdAndDelete(id);
    response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
