console.log('FILE LOADED')
const cds = require('@sap/cds');

module.exports = (srv) => {
  const { Request, ApprovalStep, AuditLog } = cds.entities('com.enterprise.approval');

  srv.before('CREATE', 'Requests', async (req) => {
    console.log('CREATE event:', req.data);
  });

  srv.on('submit', 'Requests', async (req) => {
    const { ID } = req.params[0];

    const request = await SELECT.one.from(Request).where({ ID });
    if (!request) return req.error(404, `Request ${ID} not found`);
    if (request.status !== 'DRAFT') {
      return req.error(400, `Cannot submit — current status is '${request.status}'`);
    }

    await UPDATE(Request).set({ status: 'SUBMITTED' }).where({ ID });

    const steps = [];
    if (request.amount <= 5000) {
      steps.push({
        request_ID:     ID,
        stepNumber:     1,
        approverRole:   'Manager',
        approverUserId: 'manager@company.com',
        stepStatus:     'ACTIVE',
        decision:       'PENDING'
      });
    } else {
      steps.push({
        request_ID:     ID,
        stepNumber:     1,
        approverRole:   'Manager',
        approverUserId: 'manager@company.com',
        stepStatus:     'ACTIVE',
        decision:       'PENDING'
      });
      steps.push({
        request_ID:     ID,
        stepNumber:     2,
        approverRole:   'Finance',
        approverUserId: 'finance@company.com',
        stepStatus:     'ACTIVE',
        decision:       'PENDING'
      });
    }
    await INSERT.into(ApprovalStep).entries(steps);

    await UPDATE(Request).set({ status: 'IN_APPROVAL' }).where({ ID });

    await INSERT.into(AuditLog).entries({
      request_ID:  ID,
      entityName:  'Request',
      entityId:    ID,
      action:      'SUBMITTED',
      oldValue:    'DRAFT',
      newValue:    'IN_APPROVAL',
      performedBy: req.user?.id || 'anonymous'
    });

const updated = await SELECT.one.from(Request).where({ ID });
return updated;  });
};