var m = require("mithril");

var auth = require("./src/models/auth");
var AuthenticatedPage = require("./src/components/authenticated_page");
var authView = require("./src/views/auth");
var statisticsView = require("./src/views/statistics");

m.route(document.getElementById("content"), "/statistics", {
  "/sign-in": {
    onmatch: function () {
      if (auth.Authentication.isAuthenticated) {
        m.route.set("");
      }
    },
    render: function () {
      return m(authView.SignIn);
    },
  },
  "/statistics": {
    onmatch: function () {
      if (!auth.Authentication.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: statisticsView });
    },
  },
});
