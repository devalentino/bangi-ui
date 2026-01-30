var m = require("mithril");

var auth = require("./src/models/auth");
var AuthenticatedPage = require("./src/components/authenticated_page");
var authView = require("./src/views/auth");
var statisticsView = require("./src/views/statistics");
var coreCampaignView = require("./src/views/core_campaign");
var coreCampaignsView = require("./src/views/core_campaigns");
var coreFlowsView = require("./src/views/core_flows");
var coreFlowView = require("./src/views/core_flow");

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
  "/core/campaigns": {
    onmatch: function () {
      if (!auth.Authentication.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreCampaignsView });
    },
  },
  "/core/flows": {
    onmatch: function () {
      if (!auth.Authentication.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreFlowsView });
    },
  },
  "/core/flows/:flowId": {
    onmatch: function () {
      if (!auth.Authentication.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreFlowView });
    },
  },
  "/core/campaigns/:campaignId": {
    onmatch: function () {
      if (!auth.Authentication.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreCampaignView });
    },
  },
});
