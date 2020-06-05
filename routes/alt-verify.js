const express = require('express');
const { convertToJson, xmlToJson } = require('../helpers/xml');
const shortid = require('shortid')
const Knex = require('knex')
const knexfile = require('../knexfile')

const knex = Knex(knexfile.development)

module.exports = (soapRequest) => {
  const router = express.Router();
  router.post('/', ({ body }, response, next) => {
    (async () => {
      const tagMap = {
        nin: 'NIN',
        questionCode: 'RQCode',
        answer: 'QNANSW'
      }
      const innerTag = Object.keys(body).reduce((innerTag, key) => {
        const tag = tagMap[key]
        innerTag += `<${tag}>${body[key]}</${tag}>`
        return innerTag
      }, '')
      const payload = `<Payload>${innerTag}</Payload>`
      console.log(payload)
      const result = await soapRequest.execute('AltBiometricVerification', payload)
      const json = result.payload ? await convertToJson(result.payload, getMapping()) : undefined
      
      const data = {
        id: result.id,
        code: result.code,
        result: json
      }
      response.json(data)
    })().catch(next)
  })

  return router
}

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
    SIGNATURE: 'signature',

    PREV_ANSW_CODE: 'prevCode',
    RQCode: 'questionCode',
    QUESTION: 'questionText'
  };
}