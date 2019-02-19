const sinon = require('sinon');
const chai = require('chai');
const mocks = require('./mocks');
const SoapRequest = require('../soap-request');
const Rijndael = require('../rijndael');
const RsaCrypto = require('../rsa-crypto');
const SoapEndPoint = require('../soap-end-point');
const fs = require('fs');
const path = require('path');

const expect = chai.expect;

const readFile = fileName => fs.readFileSync(path.join(__dirname, 'data', fileName), 'utf8');

describe('SoapRequest', () => {

  describe('parseResponse', () => {

    it('should parse xml data', async () => {
      const xml = readFile('dummy.xml');
      const request = new SoapRequest();
      const result = request.parseResponse(xml);

      expect(result).to.exist;
      expect(result.code).to.equal('00');
      expect(result.key).to.equal('test');
      expect(result.iv).to.equal('test');
      expect(result.payload).to.equal('test');
    });

  });

  describe('decryptPayload', () => {
    
    const encode = value => Buffer.from(value, 'utf8').toString('base64');

    it('should decrypt payload', async () => {
      const params = {
        iv: encode('iv'),
        key: encode('key'),
        signature: encode('signature'),
        payload: encode('payload')
      };

      const rijndael = mocks.rijndael();
      const rsa = mocks.rsaCrypto();

      const request = new SoapRequest(null, rsa, rijndael);
      const payload = request.decryptPayload(params);

      expect(payload).to.exist;
      expect(payload).to.equal('payload');
    });
  });

  describe('execute', () => {
    it('should execute soap request', async () => {
      const action = 'action';
      const payload = 'payload';
      const url = 'http://foo/bar';
      const response = readFile('response.xml');

      const endPoint = new SoapEndPoint(url);
      endPoint.axios.post = sinon.fake.resolves({ data: response });
      const privateKey = fs.readFileSync(__dirname + '/../keys/private.key');
      const publicKey = fs.readFileSync(__dirname + '/../keys/nida-public.cer');

      const rsaCrypto = new RsaCrypto(privateKey, publicKey);

      const request = new SoapRequest(endPoint, rsaCrypto, Rijndael);
      const createEnvelop = sinon.spy(request, 'createEnvelop');
      const parseResponse = sinon.spy(request, 'parseResponse');

      const result = await request.execute(action, payload);

      expect(parseResponse.calledWith(response)).to.be.true;

      expect(createEnvelop.calledOnce).to.be.true;
      expect(createEnvelop.firstCall.args[0].action).to.equal(action);

      const envelop = createEnvelop.firstCall.returnValue;
      expect(endPoint.axios.post.calledWith(url, envelop)).to.be.true;

      expect(result).to.exist;
      expect(result.code).to.equal('00');
      expect(result.payload).to.equal(readFile('response-payload.xml'));
    });
  })
});