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
    expect(result.code).to.equal('00');
    expect(result.profile).to.exist;

    const profile = result.profile;
    expect(profile.firstName).to.equal('BENEDICT')
    expect(profile.middleName).to.equal('JOSEPH')
    expect(profile.lastName).to.equal('TESHA')
    expect(profile.sex).to.equal('MALE')
    expect(profile.dateOfBirth).to.equal('1983-06-10')
    expect(profile.placeOfBirth).to.equal('')
    expect(profile.residentRegion).to.equal('DAR ES SALAAM (KINONDONI)')
    expect(profile.residentDistrict).to.equal('KINONDONI')
    expect(profile.residentWard).to.equal('MBEZI JUU')
    expect(profile.residentVillage).to.equal('Mbezi Kati')
    expect(profile.residentStreet).to.equal('GOBA ROAD')
    expect(profile.residentHouseNo).to.equal('KAW/MMJ910')
    expect(profile.residentPostalAddress).to.equal('PO BOX 33967')
    expect(profile.residentPostCode).to.equal('14128')
    expect(profile.birthCountry).to.equal('TANZANIA, THE UNITED REPUBLIC')
    expect(profile.birthRegion).to.equal('DAR ES SALAAM (ILALA CBD)')
    expect(profile.birthDistrict).to.equal('ILALA CBD')
    expect(profile.birthWard).to.equal('KIVUKONI')
    expect(profile.birthCertificateNo).to.equal('')
    expect(profile.nationality).to.equal('TANZANIAN')
    expect(profile.phoneNumber).to.equal('0713809050')
    expect(profile.photo).to.exist
    expect(profile.signature).to.exist
  });

  it('should return list of fingercodes if response code is 141', async () => {
    const soapRequest = new SoapRequest();
    const payload =
      `
      <NidaReponse>
        <Fingerprints>R1 | R2 | R3 | R4 | R5 | L1 | L2 | L3 | L4 | L5</Fingerprints>
      </NidaReponse>
      `
    soapRequest.execute = sinon.fake.resolves({
      id: '201902181055008908933',
      code: '141',
      payload
    })

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

    expect(result.code).to.equal('141')
    expect(result.id).to.equal('201902181055008908933')
    expect(result.fingers).to.deep.equal(['R1', 'R2', 'R3', 'R4', 'R5', 'L1', 'L2', 'L3', 'L4', 'L5'])
  })
});