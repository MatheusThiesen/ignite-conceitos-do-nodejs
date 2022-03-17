const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find((user) => user.username === username);

  if (!findUser) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  request.user = findUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);
  if (userAlreadyExist) {
    return response.status(400).send({
      error: "Mensagem do erro",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  console.log(user);

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodos = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: deadline,
    created_at: new Date(),
  };

  user.todos.push(newTodos);

  return response.status(201).send(newTodos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const findOneTodo = user.todos.find((todo) => todo.id === id);

  if (!findOneTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  findOneTodo.title = title;
  findOneTodo.deadline = deadline;

  return response.status(201).send(findOneTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findOneTodo = user.todos.find((todo) => todo.id === id);
  if (!findOneTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  findOneTodo.done = true;

  return response.status(201).send(findOneTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findOneTodo = user.todos.find((todo) => todo.id === id);

  if (!findOneTodo) {
    return response.status(404).json({
      error: "Mensagem do erro",
    });
  }

  user.todos.splice(findOneTodo, 1);

  return response.status(204).send();
});

module.exports = app;
