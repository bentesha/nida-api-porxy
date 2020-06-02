const express = require('express')
const Knex = require('knex')
const knexfile = require('../../knexfile')
const moment = require('moment')

const knex = Knex(knexfile.development)

const router = express.Router()

router.get('/', ({ query }, response, next) => {
  (async () => {
    const filter = knex.table('event_log')
    if (query.nin && query.nin.trim()) {
      filter.where('nin', 'like', `%${query.nin.trim()}%`)
    }

    const summary = await filter.clone().count({ total: '*' }).first()
    let page = isNaN(query.page) ? 1 : Number(query.page)
    page = page === 0 ? 1 : page
    const limit = 50
    const offset = (page - 1) * limit

    const logs = await filter.orderBy('timestamp', 'desc').offset(offset).limit(limit)
    const dateFormat = 'YYYY-MM-DD HH:mm:ss'
    const rows = logs.map(row => {
      row.dateTime = moment(row.timestamp).format(dateFormat)
      return row
    })

    // Generate pagination
    const pages = Math.ceil(summary.total / limit)
    const links = []
    for(let index = 0; index < pages; index++) {
      links.push({
        title: index + 1,
        url: `?page=${index + 1}&nin=${query.nin}`,
        active: index === page - 1
      })
    }

    // If it is just one page, hide links
    if (links.length === 1) {
      links.splice(0, 1)
    }

    response.render('console', { rows, query, links })
  })().catch(next)
})

router.get('/:id/:format', ({ params }, response, next) => {
  (async () => {
    const id = params.id
    const log = await knex.table('event_log').where({ id }).first()
    if (log === undefined) {
      return response.sendStatus(404)
    }

    const result = params.format.toLowerCase() === 'xml' ? log.responseXml : log.responseJson
    if (params.format === 'json') {
      return response.json(result)
    } else {
      return response.send(result)
    }
  })().catch(next)
})

module.exports = router