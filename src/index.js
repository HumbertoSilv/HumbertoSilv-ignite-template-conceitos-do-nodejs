const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({
      error: `User ${username} not found.`
    });
  };

  request.user = user;
  return next();

};

app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  };

  const newUser = { 
    id: uuidv4(),
    name,
    username, 
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const [ user ] = users.filter((user) => user.username === request.user.username);

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  
  const newToDo = { 
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newToDo);

  return response.status(201).json(newToDo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const taskId = request.params.id;
  const { title, deadline } = request.body;

  const [ task ] = user.todos.filter((task) => task.id === taskId);

  if(!task) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  };

  task.title = title;
  task.deadline = deadline;

  return response.json(task);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const taskId = request.params.id;

  const [ task ] = user.todos.filter((task) => task.id === taskId);

  if(!task) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  };

  task.done = true;

  return response.json(task);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const taskId = request.params.id;

  const [ task ] = user.todos.filter((task) => task.id === taskId);

  if(!task) {
    return response.status(404).json({error: "Todo not found."});
  };

  user.todos.splice(task, 1);

  return response.status(204).send();

});

module.exports = app;