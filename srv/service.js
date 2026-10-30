const cds = require('@sap/cds');

module.exports =cds.service.impl(async (srv) => {
  await require('./handlers/request-handler')(srv)
  await require('./handlers/approval-handler')(srv)
  await require('./handlers/validation-handler')(srv)
})