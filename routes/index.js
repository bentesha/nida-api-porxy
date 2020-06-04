const express = require('express');
const verifyFingerprint = require('./verify-fingerprint');
const errorHandler = require('./error-handler');
const altVerify = require('./alt-verify')
const consoleHandler = require('./console')

module.exports = (soapRequest) => {
  const router = express.Router();
  router.use('/verify-fingerprint', verifyFingerprint(soapRequest));
  router.use('alt-verify', altVerify(soapRequest))
  router.use(errorHandler);
  router.use('/console', consoleHandler);

  return router;
};