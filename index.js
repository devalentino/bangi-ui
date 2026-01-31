var m = require("mithril");

var AuthModel = require("./src/models/auth");
var AuthenticatedPage = require("./src/components/authenticated_page");
var authView = require("./src/views/auth");
var statisticsView = require("./src/views/statistics");
var coreCampaignView = require("./src/views/core_campaign");
var coreCampaignsView = require("./src/views/core_campaigns");
var coreFlowView = require("./src/views/core_flow");

var auth = new AuthModel();

m.route(document.getElementById("content"), "/statistics", {
  "/sign-in": {
    onmatch: function () {
      if (auth.isAuthenticated) {
        m.route.set("");
      }
    },
    render: function () {
      return m(authView.SignIn, { auth: auth });
    },
  },
  "/statistics": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, {
        page: statisticsView,
        auth: auth,
        pageAttrs: { auth: auth },
      });
    },
  },
  "/core/campaigns": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, {
        page: coreCampaignsView,
        auth: auth,
        pageAttrs: { auth: auth },
      });
    },
  },
  "/core/campaigns/:campaignId/flows/:flowId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, {
        page: coreFlowView,
        auth: auth,
        pageAttrs: { auth: auth },
      });
    },
  },
  "/core/campaigns/:campaignId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, {
        page: coreCampaignView,
        auth: auth,
        pageAttrs: { auth: auth },
      });
    },
  },
});
