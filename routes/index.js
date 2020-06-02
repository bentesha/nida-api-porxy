const express = require('express');
const verifyFingerprint = require('./verify-fingerprint');
const errorHandler = require('./error-handler');
const consoleHandler = require('./console')

module.exports = (soapRequest) => {
  const router = express.Router();
  router.use(verifyFingerprint(soapRequest));
  router.use(errorHandler);
  router.use('/console', consoleHandler);

  return router;
};