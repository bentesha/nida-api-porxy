const Rijndael = require('rijndael-js');
const padder = require('pkcs7-padding');
const crypto = require('crypto');
const assert = require('assert');

/**
 * A Rijndael cipher that encrypts/decrypts data using Rijndael-256 CBC with PKCS7 Padding
 * @param {*} key 256 bits key to use for encrypting/decrypting data. If not specified, a random key will be generated
 * @param {*} iv 256 bits IV to use for encrypting/decrypting data. If not specified, a random IV will be generated
 */
function Cipher(key, iv) {
  this.key = Buffer.isBuffer(key) ? key : Buffer.from(key || []);
  this.iv = Buffer.isBuffer(iv) ? iv : Buffer.from(iv || []);

  this.init();
}

/**
 * Initializes Key and IV with random values if they are not specified
 */
Cipher.prototype.init = function() {
  if(this.iv.length === 0) {
    this.iv = crypto.randomBytes(32);
  }

  if(this.key.length === 0) {
    this.key = crypto.randomBytes(32);
  }

  //Ensure that both IV and Key are 32 bytes in length
  assert(this.key.length === 32, 'Key must be 32 bytes in length');
  assert(this.iv.length === 32, 'Initialization vector must be 32 bytes in length');
};

/**
 * Encrypts data using Rijndael 256 CBC with PKCS7 padding
 */
Cipher.prototype.encrypt = function(data) {
  data = Buffer.from(data);
  //PKCS7 pad data to be encrypted
  const padded = padder.pad(data, 32);
  const cipher = new Rijndael(this.key, 'cbc');
  return cipher.encrypt(padded, 256, this.iv);
};

Cipher.prototype.decrypt = function(data) {
  data = Buffer.from(data);
  const cipher = new Rijndael(this.key, 'cbc');
  const decrypted = cipher.decrypt(data, 256, this.iv);
  return padder.unpad(decrypted, 32);
};

module.exports = {
  cipher() {
    return new Cipher();
  },

  decipher(key, iv) {
    return new Cipher(key, iv);
  }
};