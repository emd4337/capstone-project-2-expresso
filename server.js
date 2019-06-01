const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');

const apiRouter = require('./api/api.js');

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use(errorHandler());

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
