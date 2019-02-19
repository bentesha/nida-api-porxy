const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const morgan  = require('morgan');

module.exports = (soapRequest) => {
  const app = express();
  app.use(bodyParser.json({ limit: '10mb' })); //Allow up to 10mb of request data
  if(process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }
  app.use(routes(soapRequest));

  return app;
};