const sinon = require('sinon');
const fs = require('fs');

module.exports = (file) => {
  const xml = fs.readFileSync(__dirname + '/../data/' + file, 'utf8');
  return { post: sinon.fake.resolves(xml) }
};
