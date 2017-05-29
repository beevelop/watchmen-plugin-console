'use strict'

const moment = require('moment')
const winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { 'timestamp': true, 'colorize': true })

exports = module.exports = (watchmen) => {
  watchmen.on('new-outage', (service, outage) => {
    winston.error(`${service.name} down!`, outage.error)
  })

  watchmen.on('current-outage', (service, outage) => {
    winston.error(`${service.name} is still down!`, outage.error)
  })

  watchmen.on('service-error', (service, data) => {
    winston.error(`${service.name} check failed!`, data.error)
  })

  watchmen.on('latency-warning', (service, data) => {
    winston.warn(`${service.name} latency warning. Took: ${data.elapsedTime}ms`)
  })
  
  watchmen.on('service-back', (service, lastOutage) => {
    let duration = moment.duration(moment().diff(lastOutage.timestamp))
    winston.info(`${service.name} is back. Down for ${duration.humanize()}`)
  })

  watchmen.on('service-ok', (service, data) => {
    winston.info(`${service.name} responded OK! ${data.elapsedTime}ms`)
  })
}
