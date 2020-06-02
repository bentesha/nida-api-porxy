const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const morgan  = require('morgan');
const path = require('path');

module.exports = (soapRequest) => {
  const app = express();
  app.set('view engine', 'ejs')

  app.use(bodyParser.json({ limit: '10mb' })); //Allow up to 10mb of request data
  if(process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))
  app.use(routes(soapRequest));

  return app;
};