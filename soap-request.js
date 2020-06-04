const moment = require('moment');
const shortid = require('shortid');

function SoapRequest(endPoint, rsaCrypto, rijndael) {
  this.rsaCrypto = rsaCrypto;
  this.endPoint = endPoint;
  this.rijndael = rijndael;
}

module.exports = SoapRequest;

const encode = buffer => buffer.toString('base64');

SoapRequest.prototype.execute = async function (action, payload) {
  const cipher = this.rijndael.cipher(); //Creates rijndael cipher with random key and iv
  payload = cipher.encrypt(payload);
  key = this.rsaCrypto.publicEncrypt(cipher.key);
  iv = this.rsaCrypto.publicEncrypt(cipher.iv);
  signature = this.rsaCrypto.createSignature(payload);

  const params = {
    payload: encode(payload),
    iv: encode(iv),
    key: encode(key),
    signature: encode(signature),
    action
  };

  const envelop = this.createEnvelop(params);
  const response = await this.endPoint.post(envelop, action);
  const result = this.parseResponse(response);
  if(result.key && result.iv && result.payload && result.signature) {
    const payload = this.decryptPayload(result);
    return {
      id: result.id,
      code: result.code,
      payload
    };
  } else {
    return {
      id: result.id,
      code: result.code
    };
  }
};

/**
 * Returns the first matched group of a regular expression or null if not match was found
 * @param {RegEx} regex 
 * @param {String} string 
 */
const getMatch = (regex, string) => {
  const match = regex.exec(string);
  return match && match[1];
};

/**
 * Converts a base64 string value to binary data represented by Buffer instance
 */
const decode = base64Value => base64Value && Buffer.from(base64Value, 'base64');

SoapRequest.prototype.parseResponse = function(xml) {
  const regId = /<.{1}:Id>(.+)<\/.{1}:Id>/gi;
  const regCode = /<.{1}:Code>(.+)<\/.{1}:Code>/gi;
  const regIV = /<.{1}:EncryptedCryptoIV>(.+)<\/.{1}:EncryptedCryptoIV>/gi;
  const regKey = /<.{1}:EncryptedCryptoKey>(.+)<\/.{1}:EncryptedCryptoKey>/gi;
  const regPayload = /<.{1}:Payload>(.+)<\/.{1}:Payload>/gi;
  const regSignature = /<.{1}:Signature>(.+)<\/.{1}:Signature>/gi;

  const id = getMatch(regId, xml);
  const code = getMatch(regCode, xml);
  
  const iv = getMatch(regIV, xml);
  const key = getMatch(regKey, xml);
  const payload = getMatch(regPayload, xml);
  const signature = getMatch(regSignature, xml);

  return { id, code, iv, key, payload, signature };
};

SoapRequest.prototype.decryptPayload = function(params) {
  const payload = decode(params.payload);
  const key = decode(params.key);
  const iv = decode(params.iv);
  const signature = decode(params.signature);

  const verified = this.rsaCrypto.verifySignature(payload, signature);
  //TODO: Return response to indicate if signature verification failed

  const decryptedIV = this.rsaCrypto.privateDecrypt(iv);
  const decryptedKey = this.rsaCrypto.privateDecrypt(key);

  const decipher = this.rijndael.decipher(decryptedKey, decryptedIV);
  return decipher.decrypt(payload).toString('utf8');
};

SoapRequest.prototype.createEnvelop = function(params) {
  return `
  <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:tem="http://tempuri.org/" xmlns:nid="http://schemas.datacontract.org/2004/07/NID_API">
  <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing"><wsa:Action>http://tempuri.org/IGatewayService/${params.action}</wsa:Action><wsa:To>https://nacer01/TZ_CIG/GatewayService.svc</wsa:To></soap:Header>
    <soap:Body>
      <tem:${params.action}>
        <!--Optional:-->
        <tem:iRequest>
          <!--Optional:-->
          <nid:Body>
              <!--Optional:-->
              <nid:CryptoInfo>
                <!--Optional:-->
                <nid:EncryptedCryptoIV>${params.iv}</nid:EncryptedCryptoIV>
                <!--Optional:-->
                <nid:EncryptedCryptoKey>${params.key}</nid:EncryptedCryptoKey>
              </nid:CryptoInfo>
              <!--Optional:-->
              <nid:Payload>${params.payload}</nid:Payload>
              <!--Optional:-->
              <nid:Signature>${params.signature}</nid:Signature>
          </nid:Body>
          <!--Optional:-->
          <nid:Header>
              <!--Optional:-->
              <nid:ClientNameOrIP>SMILE</nid:ClientNameOrIP>
              <!--Optional:-->
              <nid:Id>${shortid.generate()}</nid:Id>
              <!--Optional:-->
              <nid:TimeStamp>${moment().format('YYYYMMDDHHmmss')}</nid:TimeStamp>
              <!--Optional:-->
              <nid:UserId>SMILE</nid:UserId>
          </nid:Header>
        </tem:iRequest>
      </tem:${params.action}>
    </soap:Body>
</soap:Envelope>
  `
}
