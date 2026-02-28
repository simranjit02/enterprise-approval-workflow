const cds = require('@sap/cds');

module.exports =cds.service.impl(async (srv) => {
  require('./handlers/request-handler')(srv)
  // require('./handlers/approval-handler')(srv)
  // require('./handlers/workflow-handler')(srv)
  // require('./handlers/audit-handler')(srv)
})