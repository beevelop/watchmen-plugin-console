var moment = require('moment')
var winston = require('winston')
winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, {
  'timestamp': true,
  'colorize': true
})

var eventHandlers = {

  /**
   * On a new outage
   * @param {Object} service
   * @param {Object} outage
   * @param {Object} outage.error check error
   * @param {number} outage.timestamp outage timestamp
   */
  onNewOutage: (service, outage) => {
    winston.error(`${service.name} down!`, outage.error)
  },

  /**
   * Failed ping on an existing outage
   * @param {Object} service
   * @param {Object} outage
   * @param {Object} outage.error check error
   * @param {number} outage.timestamp outage timestamp
   */
  onCurrentOutage: (service, outage) => {
    winston.error(`${service.name} is still down!`, outage.error)
  },

  /**
   * Failed check (it will be an outage or not according to service.failuresToBeOutage
   * @param {Object} service
   * @param {Object} data
   * @param {Object} data.error check error
   * @param {number} data.currentFailureCount number of consecutive check failures
   */
  onFailedCheck: (service, data) => {
    winston.error(`${service.name} check failed!`, data.error)
  },

  /**
   * Warning alert
   * @param {Object} service
   * @param {Object} data
   * @param {number} data.elapsedTime (ms)
   */
  onLatencyWarning: (service, data) => {
    winston.warn(`${service.name} latency warning. Took: ${data.elapsedTime}ms`)
  },

  /**
   * Service is back online
   * @param {Object} service
   * @param {Object} lastOutage
   * @param {Object} lastOutage.error
   * @param {number} lastOutage.timestamp (ms)
   */
  onServiceBack: (service, lastOutage) => {
    var duration = moment.duration(+new Date() - lastOutage.timestamp, 'seconds')
    winston.info(`${service.name} is back. Down for ${duration.humanize()}`)
  },

  /**
   * Service is responding correctly
   * @param {Object} service
   * @param {Object} data
   * @param {number} data.elapsedTime (ms)
   */
  onServiceOk: (service, data) => {
    winston.info(`${service.name} responded OK! ${data.elapsedTime}ms`)
  }
}

exports = module.exports = (watchmen) => {
  watchmen.on('new-outage', eventHandlers.onNewOutage)
  watchmen.on('current-outage', eventHandlers.onCurrentOutage)
  watchmen.on('service-error', eventHandlers.onFailedCheck)

  watchmen.on('latency-warning', eventHandlers.onLatencyWarning)
  watchmen.on('service-back', eventHandlers.onServiceBack)
  watchmen.on('service-ok', eventHandlers.onServiceOk)
}
