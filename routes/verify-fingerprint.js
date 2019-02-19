const express = require('express');
const { convertToJson } = require('../helpers/xml');
const validator = require('./middleware/validate-verify-fingerprint');

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
      
      return soapRequest.execute('BiometricVerification', payload)
        .then(async result => {
          if(result.code === '00') {
            //Finger print mactch was successfull
            const json = await convertToJson(result.payload, getMapping());
            response.json({
              code: result.code,
              profile: json
            });
          } else {
            response.json({
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