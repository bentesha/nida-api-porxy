const env = require('dotenv');
env.config();

exports.serviceEndPoint = process.env.SERVICE_END_POINT
exports.port = process.env.PORT

exports.tcra = {
  operatorCode: process.env.TCRA_OPERATOR_CODE || '00004',
  password: process.env.TCRA_PASSWORD || 'password',
  endPoint: process.env.TCRA_END_POINT || 'https://csisadditional-test.tcra.go.tz/REST-API/tcra/additionalSIMResponse'
}
