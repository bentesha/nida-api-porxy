const crypto = require('crypto');
const constants = require('constants');

function RsaCrypto(privateKey, publicKey) {
  this.privateKey = privateKey;
  this.publicKey = publicKey;
};

/**
 * Public encrypt data using provided public key
 */
RsaCrypto.prototype.publicEncrypt = function(data) {
  const encryptOptions = {
    key: this.publicKey,
    padding: constants.RSA_PKCS1_PADDING
  };

  return crypto.publicEncrypt(encryptOptions, data);
};

/**
 * Decrypts data using provided private key
 */
RsaCrypto.prototype.privateDecrypt = function(data) {
  const encryptOptions = {
    key: this.privateKey,
    padding: constants.RSA_PKCS1_PADDING
  };
  return crypto.privateDecrypt(encryptOptions, data);
};

/**
 * Create RSA256-SHA1 signature of data using provided private key
 */
RsaCrypto.prototype.createSignature = function(data) {
  const signer = crypto.createSign('RSA-SHA1');
  signer.update(data);
  return signer.sign(this.privateKey);
};

/**
 * Verifies RSA256-SHA1 signature using provided public key
 */
RsaCrypto.prototype.verifySignature = function(data, signature) {
  const verifier = crypto.createVerify('RSA-SHA1');
  verifier.update(data);
  return verifier.verify(this.publicKey, signature);
};

module.exports = RsaCrypto;