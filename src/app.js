const express = require('express');
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

require('./db/mongoose');

const app = express();

app.use(express.json());

app.use(usersRouter);
app.use(tasksRouter);

module.exports = app;
