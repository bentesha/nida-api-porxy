const sinon = require('sinon');

module.exports = () => {
  const instance = {
    publicEncrypt: value => value,
    privateDecrypt: value => value,
    createSignature: value => value,
    verifySignature: () => true
  };

  sinon.spy(instance, 'publicEncrypt');
  sinon.spy(instance, 'privateDecrypt');
  sinon.spy(instance, 'createSignature');
  sinon.spy(instance, 'verifySignature');

  return instance;
}