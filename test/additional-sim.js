const createApp = require('../app')
const config = require('../config')
const chai = require('chai')
const supertest = require('supertest')
const nock = require('nock')
const fs = require('fs')
const path = require('path')

const expect = chai.expect


describe('API /additional-sim', () => {

  it('should response with a success response', async () => {
    const app = createApp({})
    const payload = {
      agentCode: '123',
      agentNIN: '12345678901234567890',
      agentMSISDN: '255123456789',
      conversationId: '39938333',
      customerMSISDN: '255987654321',
      customerNIN: '09876543211234567890',
      reasonCode: '1006',
      registrationCategoryCode: '2000',
      otherNumbers: ['25511111111']
    }

    const responseXml = fs.readFileSync(path.join(__dirname, 'data', 'additional-sim-response.xml'), 'utf8')
    
    const scope = nock(config.tcra.endPoint)
      .post('/')
      .reply(200, responseXml)

    const { body } = await supertest(app)
      .post('/additionalSIMCard')
      .send(payload)
      .expect(200)

    scope.done() // Assert config.tcra.endPoint is called
    
    expect(body.conversationId).to.equal('111-2345-55688')
    expect(body.responseCode).to.equal('150')
    expect(body.responseDescription).to.equal('Approved')
    expect(body.timestamp).to.equal('20200622171244')
    expect(body.transactionId).to.equal('20200622171244-00002-1592835164157')
  })
})
