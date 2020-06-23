const express = require('express')
const Joi = require('joi')
const moment = require('moment')
const crypto = require('crypto')
const axios = require('axios').default
const { xmlToJson } = require('../helpers/xml')
const config = require('../config')

const schema = Joi.object({
  agentCode: Joi.string().required(),
  agentMSISDN: Joi.string().required(),
  agentNIN: Joi.string().required(),
  conversationId: Joi.string().required(),
  customerMSISDN: Joi.string().required(),
  customerNIN: Joi.string().required(),
  reasonCode: Joi.string().required(),
  registrationCategoryCode: Joi.string().required(),
  otherNumbers: Joi.array().items(Joi.string()).min(0).required(),
})

const router = express.Router()

const http = axios.create({
  baseURL: config.tcra.endPoint
})

router.post('/', ({ body }, response, next) => {
  ;(async () => {
    // Validate request body
    const { error, value } = schema.validate(body)
    if (error) {
      const errors = error.details.reduce((cum, detail) => {
        cum[detail.context.key] = detail.message
      }, {})
      return response.status(400).json(errors)
    }
    // Generate timestamp
    const timestamp = moment().format('YYYYMMDDHHmmss')
    const combined = [config.tcra.operatorCode, config.tcra.password, timestamp].join('-')
    const hash = crypto
      .createHash('SHA256')
      .update(combined)
      .digest()
      .toString('hex')
      .toUpperCase()

    const encodeOtherNumbers = () => {
      if (value.otherNumbers.length === 0) {
        return '<otherNumber/>'
      }
      return value.otherNumbers.map(msisdn => {
        return `
          <otherNumber>
            <msisdn>${msisdn}</msisdn>
          </otherNumber>
          `
      })
    }

    const payload = `
      <?xml version="1.0"?>
      <mamlakaSIMRequest>
        <requestHeader>
          <operatorCode>${config.tcra.operatorCode}</operatorCode>
          <timestamp>${timestamp}</timestamp>
          <token>${hash}</token>
        </requestHeader>
        <requestBody>
          <agentCode>${value.agentCode}</agentCode>
          <agentMSISDN>${value.agentMSISDN}</agentMSISDN>
          <agentNIN>${value.agentNIN}</agentNIN>
          <conversationID>${value.conversationId}</conversationID>
          <customerMSISDN>${value.customerMSISDN}</customerMSISDN>
          <customerNIN>${value.customerNIN}</customerNIN>
          <reasonCode>${value.reasonCode}</reasonCode>
          <registrationCategoryCode>${value.registrationCategoryCode}</registrationCategoryCode>
          ${encodeOtherNumbers()}
        </requestBody>
      </mamlakaSIMRequest>
      `
    
    const json = await http
      .post('/', payload)
      .then(response => response.data)
      .then(xmlToJson)
      .then(json => json.mamlakaSIMResponse)

    json.conversationId = json.conversationID
    json.transactionId = json.transactionID
    delete json.transactionID
    delete json.conversationID

    response.json(json)
  })().catch(next)
})

module.exports = router
