sap.ui.define([], function () {
    "use strict";

    return {
        logout: function () {
            // Overwrite the browser's cached Basic-auth login (local mocked users) with an invalid one.
            // A 401 means that worked: go to the local sign-in page, then come back here.
            // Anything else means we're behind the approuter (XSUAA), which has its own logout endpoint.
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/odata/v4/approval/", true, "logout", "logout");
            xhr.onloadend = function () {
                if (xhr.status === 401) {
                    window.location.href = "/login.html?return=" + encodeURIComponent(window.location.pathname);
                } else {
                    window.location.href = "/do/logout";
                }
            };
            xhr.send();
        }
    };
});
