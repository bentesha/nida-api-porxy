const chai = require('chai');
const sinon = require('sinon');
const rijndael = require('../rijndael');
const RsaCrypto  = require('../rsa-crypto');
const SoapEndPoint = require('../soap-end-point');
const SoapRequest = require('../soap-request');
const supertest = require('supertest');
const fs = require('fs');
const path = require('path');
const createApp = require('../app');

const expect = chai.expect;

const privateKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'private.key'));
const publicKey = fs.readFileSync(path.join(__dirname, '..', 'keys', 'nida-public.cer'));
const rsaCrypto = new RsaCrypto(privateKey, publicKey);
const endPoint = new SoapEndPoint();
const responseXml = fs.readFileSync(path.join(__dirname, 'data', 'response.xml'));

describe('API /verify-fingerprint', () => {
  it('should return a json response', async () => {
    const soapRequest = new SoapRequest(endPoint, rsaCrypto, rijndael);
    endPoint.post = sinon.fake.resolves(responseXml);

    const data = {
      nin: 'nin',
      template: fs.readFileSync(path.join(__dirname, 'data', 'fingerprint.b64'), 'utf8'),
      fingerCode: 'R1'
    };

    const app = createApp(soapRequest);

    const { body: result } = await supertest(app)
      .post('/verify-fingerprint')
      .send(data)
      .expect(200);
    
    expect(result).to.exist;
    expect(result.code).to.equal('00');
    expect(result.profile).to.exist;
  });
});