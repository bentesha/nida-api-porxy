
exports.up = function(knex) {
  return knex.schema.createTable('event_log', table => {
    table.string('id').primary()
    table.string('transId')
    table.string('code')
    table.string('finger')
    table.bigInteger('timestamp')
    table.string('nin').notNullable()
    table.integer('requestTime').notNullable()
    table.text('responseXml').notNullable()
    table.text('responseJson').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('event_log')
};
