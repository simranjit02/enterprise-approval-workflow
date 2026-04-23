const cds = require('@sap/cds');

module.exports =cds.service.impl(async (srv) => {
  await require('./handlers/request-handler')(srv)
  await require('./handlers/approval-handler')(srv)
  // require('./handlers/vendor-handler')(srv);

  // require('./handlers/workflow-handler')(srv)
  // require('./handlers/audit-handler')(srv)
})