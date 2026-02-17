var m = require("mithril");

var api = require("./src/models/api");
var AuthenticatedPage = require("./src/components/authenticated_page");
var authView = require("./src/views/auth");
var statisticsView = require("./src/views/statistics");
var expensesReportView = require("./src/views/expenses_report");
var coreCampaignView = require("./src/views/core_campaign");
var coreCampaignsView = require("./src/views/core_campaigns");
var coreFlowView = require("./src/views/core_flow");
var facebookPacsExecutorsView = require("./src/views/facebook_pacs_executors");
var facebookPacsExecutorView = require("./src/views/facebook_pacs_executor");
var facebookPacsBusinessPortfoliosView = require("./src/views/facebook_pacs_business_portfolios");
var facebookPacsBusinessPortfolioView = require("./src/views/facebook_pacs_business_portfolio");
var facebookPacsBusinessPortfolioAccessUrlsView = require(
  "./src/views/facebook_pacs_business_portfolio_access_urls",
);
var facebookPacsBusinessPortfolioAccessUrlView = require(
  "./src/views/facebook_pacs_business_portfolio_access_url",
);
var facebookPacsAdCabinetsView = require("./src/views/facebook_pacs_ad_cabinets");
var facebookPacsAdCabinetView = require("./src/views/facebook_pacs_ad_cabinet");
var facebookPacsCampaignsView = require("./src/views/facebook_pacs_campaigns");
var facebookPacsCampaignView = require("./src/views/facebook_pacs_campaign");
var facebookPacsBusinessPagesView = require("./src/views/facebook_pacs_business_pages");
var facebookPacsBusinessPageView = require("./src/views/facebook_pacs_business_page");

var auth = api.auth;

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
      return m(AuthenticatedPage, { page: statisticsView, auth: auth });
    },
  },
  "/reports/expenses": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: expensesReportView, auth: auth });
    },
  },
  "/core/campaigns": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreCampaignsView, auth: auth });
    },
  },
  "/core/campaigns/:campaignId/flows/:flowId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreFlowView, auth: auth });
    },
  },
  "/core/campaigns/:campaignId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: coreCampaignView, auth: auth });
    },
  },
  "/facebook/pacs/executors": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsExecutorsView, auth: auth });
    },
  },
  "/facebook/pacs/executors/:executorId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsExecutorView, auth: auth });
    },
  },
  "/facebook/pacs/business-portfolios": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPortfoliosView, auth: auth });
    },
  },
  "/facebook/pacs/business-portfolios/:businessPortfolioId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPortfolioView, auth: auth });
    },
  },
  "/facebook/pacs/business-portfolios/:businessPortfolioId/access-urls": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPortfolioAccessUrlsView, auth: auth });
    },
  },
  "/facebook/pacs/business-portfolios/:businessPortfolioId/access-urls/new": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPortfolioAccessUrlView, auth: auth });
    },
  },
  "/facebook/pacs/ad-cabinets": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsAdCabinetsView, auth: auth });
    },
  },
  "/facebook/pacs/ad-cabinets/:adCabinetId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsAdCabinetView, auth: auth });
    },
  },
  "/facebook/pacs/campaigns": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsCampaignsView, auth: auth });
    },
  },
  "/facebook/pacs/campaigns/:campaignId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsCampaignView, auth: auth });
    },
  },
  "/facebook/pacs/business-pages": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPagesView, auth: auth });
    },
  },
  "/facebook/pacs/business-pages/:businessPageId": {
    onmatch: function () {
      if (!auth.isAuthenticated) {
        m.route.set("/sign-in");
      }
    },
    render: function () {
      return m(AuthenticatedPage, { page: facebookPacsBusinessPageView, auth: auth });
    },
  },
});
