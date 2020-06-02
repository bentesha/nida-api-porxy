const shortid = require('shortid')

exports.seed = async function(knex) {
  // Clear database
  await knex('event_log').delete()

  const totalRows = 1000
  for (let counter = 1; counter <= totalRows; counter++) {
    const row = {
      id: shortid.generate(),
      transId: shortid.generate() + shortid.generate(),
      code: ['141', '00', '134'][Math.floor(Math.random() * 3)],
      finger: 'R1',
      timestamp: new Date().getTime(),
      requestTime: Math.floor(Math.random() * 6000),
      nin: '77377366947-38838-23',
      responseXml: '<xml></xml>',
      responseJson: '{ name: "Hello" }'
    }

    await knex.table('event_log').insert(row)
  }
};
