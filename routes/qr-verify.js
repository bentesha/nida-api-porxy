const express = require('express');
const CryptoHelper = require('../crypto-helper');
const SoapRequest = require('../soap-request');

module.exports = (options) => {
  const cryptoHelper = new CryptoHelper(options.privateKey, options.publicKey);
  const router = express.Router();

  router.post('/rq-verify/:nin', ({ params }, response, next) => {
    (async () => {
      const nin = params.nin;
    
    //NIN must be 20 digits in length
    if(!nin || nin.length !== 20) {
      const message = 'NIN must be 20 digits in length';
      return response.status(422).send(message);
    }

      const payload = 
      `
      <Payload>
        <NIN>${nin}</NIN>
      </Payload>
      `;
      
      const request = new SoapRequest('RQVerification', cryptoHelper);
      request.execute(payload)
        .then(data => response.send(data))
        .catch(error => {
          console.log(error);
          if(error.response && error.response.status) {
            response.status(error.response.status).send(error.response.data);
          } else {
            response.sendStatus(500);
          }
        })
    })().catch(next);
  });

  return router;
}
