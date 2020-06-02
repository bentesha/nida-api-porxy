const express = require('express');
const { convertToJson, xmlToJson } = require('../helpers/xml');
const validator = require('./middleware/validate-verify-fingerprint');
const shortid = require('shortid')

module.exports = (soapRequest) => {

  const router = express.Router();
  router.post('/verify-fingerprint', validator, ({ body }, response, next) => {
    (async () => {
      const { nin, template, fingerCode } = body;
      const payload = 
      `
      <Payload>
        <NIN>${nin}</NIN>
        <FINGERIMAGE>${template}</FINGERIMAGE>
        <FINGERCODE>${fingerCode}</FINGERCODE>
      </Payload>
      `;
      
      const log = {
        id: shortid.generate(),
        finger: fingerCode,
        timestamp: new Date().getTime(),
        nin: nin
      }

      return soapRequest.execute('BiometricVerification', payload)
        .then(async result => {
          log.requestTime = new Date().getTime() - log.timestamp
          log.code = result.code
          log.transId = result.id || ''
          log.responseXml = result.payload || ''

          if(result.code === '00') {
            //Finger print match was successfull
            const json = await convertToJson(result.payload, getMapping());
            log.requestJson = await xmlToJson(result.payload);

            response.json({
              id: result.id,
              code: result.code,
              profile: json
            });
          } else {
            log.responseJson = ''

            response.json({
              id: result.id,
              code: result.code
            });
          }
        })
    })().catch(next);
  });
  
  return router;
};

function getMapping() {
  return {
    FIRSTNAME: 'firstName',
    MIDDLENAME: 'middleName',
    SURNAME: 'lastName',
    OTHERNAMES: 'otherNames',
    SEX: 'sex',
    DATEOFBIRTH: 'dateOfBirth',
    PLACEOFBIRTH: 'placeOfBirth',
    RESIDENTREGION: 'residentRegion',
    RESIDENTDISTRICT: 'residentDistrict',
    RESIDENTWARD: 'residentWard',
    RESIDENTVILLAGE: 'residentVillage',
    RESIDENTSTREET: 'residentStreet',
    RESIDENTHOUSENO: 'residentHouseNo',
    RESIDENTPOSTALADDRESS: 'residentPostalAddress',
    RESIDENTPOSTCODE: 'residentPostCode',
    BIRTHCOUNTRY: 'birthCountry',
    BIRTHREGION: 'birthRegion',
    BIRTHDISTRICT: 'birthDistrict',
    BIRTHWARD: 'birthWard',
    BIRTHCERTIFICATENO: 'birthCertificateNo',
    NATIONALITY: 'nationality',
    PHONENUMBER: 'phoneNumber',
    PHOTO: 'photo',
    SIGNATURE: 'signature'
  };
}