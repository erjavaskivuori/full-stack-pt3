const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const Person = require('./models/person');

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  };

  next(error)
};

morgan.token('data', function (request, response) {
  const person = request.body;
  return JSON.stringify(person);
});

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data'),
);

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
};

app.post('/api/persons', (request, response) => {
  const body = request.body;
  if (body.name === '') {
    return response.status(400).json({ error: 'Name is missing' })
  }

  if (body.number === '') {
    return response.status(400).json({ error: 'Number is missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then(savedPerson => {
    response.json(savedPerson)
  });
});

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
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  if (body.number === '') {
    return response.status(400).json({ error: 'Number is missing' })
  }

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error));
})

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
