const axios = require('axios');

function SoapEndPoint(url) {
  this.url = url;
  this.axios = axios.create({
    headers: {
	  'Accept-Encoding': 'gzip,deflate',
	  'Connection': 'Keep Alive',
    'Content-Type': 'text/xml;charset=UTF-8',
    'User-Agent': 'Apache-HttpClient/4.1.1 (java 1.5)',
	  'Host': 'nacer01'
    }
  });
}

SoapEndPoint.prototype.post = async function (data, action = 'BiometricVerification') {
  const headers = {
    'Content-Type': `application/soap+xml;charset=UTF-8;action="http://tempuri.org/IGatewayService/${action}"`
  }
  return this.axios.post(this.url, data, { headers })
    .then(response => {
      return response.data;
    });
};

module.exports = SoapEndPoint;
