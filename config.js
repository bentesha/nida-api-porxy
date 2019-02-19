const env = require('dotenv');
env.config();

exports.serviceEndPoint = process.env.SERVICE_END_POINT = 'https://nacer01/CIG_Test/GatewayService.svc';