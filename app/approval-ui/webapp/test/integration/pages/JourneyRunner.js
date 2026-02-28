sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"approvalui/test/integration/pages/RequestsList",
	"approvalui/test/integration/pages/RequestsObjectPage"
], function (JourneyRunner, RequestsList, RequestsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('approvalui') + '/test/flp.html#app-preview',
        pages: {
			onTheRequestsList: RequestsList,
			onTheRequestsObjectPage: RequestsObjectPage
        },
        async: true
    });

    return runner;
});

