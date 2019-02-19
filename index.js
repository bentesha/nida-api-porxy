const fs = require('fs');
const path = require('path');
const createApp = require('./app');
const rijndael = require('./rijndael');
const SoapRequest = require('./soap-request');
const SoapEndPoint = require('./soap-end-point');
const RsaCrypto = require('./rsa-crypto');
const config = require('./config');

const privateKeyPath = path.join(__dirname, 'keys', 'private.key');
const publicKeyPath = path.join(__dirname, 'keys', 'nida-public.cer');

const privateKey = fs.readFileSync(privateKeyPath);
const publicKey = fs.readFileSync(publicKeyPath);

const rsaCrypto = new RsaCrypto(privateKey, publicKey);
const endPoint = new SoapEndPoint(config.serviceEndPoint);
const soapRequest = new SoapRequest(endPoint, rsaCrypto, rijndael);

const app = createApp(soapRequest);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

app.listen(config.port, () => console.log('Listening on port:', config.port));

