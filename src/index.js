const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User don't exist!" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const user = users.find(user => user.username === username);

  if (user) {
    return response.status(400).json({ error: "Username already exist! "});
  }

  const newUser = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo don't exist! "});
  }

  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = deadline;

  return response.json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  
  if (todoIndex < 0) {
    return response.status(404).json({ error: "todo don't exist!" });
  }
    
  user.todos[todoIndex].done = true;

  return response.json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "todo don't exist!" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;