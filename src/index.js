const express = require('express');
const usersRouter = require('./routers/users');
const tasksRouter = require('./routers/tasks');

require('./db/mongoose');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(usersRouter);
app.use(tasksRouter);

/// Default ///
app.get('*', (req, res) => {
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);

  res.status(404).send();
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
