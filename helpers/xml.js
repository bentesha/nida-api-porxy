const parseString = require('xml2js').parseString;


exports.convertToJson = (xml, mapping = {}) => {
  const options = {
    explicitArray: false
  };

  return new Promise((resolve, reject) => {
    parseString(xml, options, (error, result) => {
      if(error) {
        console.log('Passing XML failed', error);
        reject(error);
        return;
      }
      const json = Object.entries(mapping).reduce((json, [key, value]) => {
        if (result.NidaResponse[key] === undefined) {
          return json
        }
        json[value] = result.NidaResponse[key];
        return json;
      }, {});
      resolve(json);
    });
  });
}

exports.xmlToJson = (xml) => {
  const options = {
    explicitArray: false
  };

  return new Promise((resolve, reject) => {
    parseString(xml, options, (error, result) => {
      if(error) {
        console.log('Passing XML failed', error);
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}
