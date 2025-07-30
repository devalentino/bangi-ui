var m = require("mithril")

var auth = require("./src/models/auth")

var authView = require("./src/pages/auth")
var statistics = require("./src/pages/statistics/views")

m.route(document.getElementById("content"), "/statistics", {
    "/sign-in": {
        onmatch: function() {
            if (auth.Authentication.isAuthenticated) {
                m.route.set('')
                return
            }

            return authView.SignIn;
        }
    },
    "/statistics": {
        onmatch: function() {
            if (!auth.Authentication.isAuthenticated) {
                m.route.set('/sign-in')
                return
            }

            return statistics.Statistics;
        },
    }
});
