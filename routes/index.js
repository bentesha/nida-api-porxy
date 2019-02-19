const express = require('express');
const verifyFingerprint = require('./verify-fingerprint');
const errorHandler = require('./error-handler');

module.exports = (soapRequest) => {
  const router = express.Router();
  router.use(verifyFingerprint(soapRequest));
  router.use(errorHandler);

  return router;
};