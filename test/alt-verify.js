const chai = require('chai');
const sinon = require('sinon');
const SoapRequest = require('../soap-request');
const supertest = require('supertest');
const fs = require('fs');
const path = require('path');
const createApp = require('../app');

const expect = chai.expect;

describe('API /verify-fingerprint', () => {
  it('should return a json response', async () => {
    const soapRequest = new SoapRequest(endPoint, rsaCrypto, rijndael);
    endPoint.post = sinon.fake.resolves(responseXml);

    const data = {
      nin: '12345678900987654321',
      template: fs.readFileSync(path.join(__dirname, 'data', 'fingerprint.b64'), 'utf8'),
      fingerCode: 'R1'
    };

    const app = createApp(soapRequest);

    const { body: result } = await supertest(app)
      .post('/verify-fingerprint')
      .send(data)
      .expect(200);
    
    expect(result).to.exist;
  })
})
