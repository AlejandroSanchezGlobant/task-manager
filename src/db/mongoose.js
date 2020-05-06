const mongoose = require('mongoose');

const connectionURL = process.env.DB_CONNECTION_URL;
const databaseName = process.env.DB_NAME;
const connectionString = `${connectionURL}/${databaseName}`;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
