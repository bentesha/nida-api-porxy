const env = require('dotenv');
env.config();

exports.serviceEndPoint = process.env.SERVICE_END_POINT
exports.port = process.env.PORT
