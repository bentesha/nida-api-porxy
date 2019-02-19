const sinon = require('sinon');

const randValue = '00000000111111112222222233333333'

module.exports = () => {
  const cipher = {
    key: Buffer.from(randValue),
    iv: Buffer.from(randValue),
    encrypt: value => value,
    decrypt: value => value,
  };

  sinon.spy(cipher, 'encrypt');
  sinon.spy(cipher, 'decrypt');

  return {
    randValue: Buffer.from(randValue),
    cipher: () => cipher,
    decipher: () => cipher
  };
}