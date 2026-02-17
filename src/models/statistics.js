const m = require("mithril");
const api = require("./api");

class StatisticsFilter {
  constructor() {
    this.periodStart = null;
    this.periodEnd = null;
    this.campaignId = null;
    this.groupBy = null;
  }

  isReady() {
    return (
      this.periodStart !== null &&
      this.periodEnd !== null &&
      this.campaignId !== null
    );
  }

  periodStartIsoDate() {
    return new Date(this.periodStart).toISOString().slice(0, 10);
  }

  periodEndIsoDate() {
    return new Date(this.periodEnd).toISOString().slice(0, 10);
  }
}

class StatisticsModel {
  constructor() {
    this.filter = new StatisticsFilter();
    this.report = null;
    this.parameters = null;
    this.groupParameters = null;
    this.campaigns = [];
    this.campaignError = null;
    this.activeChartTab = "clicks";
  }

  loadCampaigns() {
    return api
      .request({
        method: "GET",
        url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns`,
      })
      .then(function (payload) {
        this.campaigns = payload.content;
        this.campaignError = null;
      }.bind(this))
      .catch(function () {
        this.campaigns = [];
        this.campaignError = "Failed to load campaigns.";
      }.bind(this));
  }

  initialize() {
    return this.loadCampaigns().then(function () {
      if (this.filter.campaignId === null && this.campaigns.length > 0) {
        this.filter.campaignId = this.campaigns[0].id;
      }
      this.loadStatisticsReport();
    }.bind(this));
  }

  loadStatisticsReport() {
    if (!this.filter.isReady()) {
      return;
    }

    var parameters = {
      periodStart: this.filter.periodStartIsoDate(),
      periodEnd: this.filter.periodEndIsoDate(),
      campaignId: this.filter.campaignId,
    };

    if (this.filter.groupBy) {
      parameters.groupParameters = this.filter.groupBy;
    }

    api.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/reports/statistics`,
      params: parameters,
    }).then(function (payload) {
      this.report = payload.content.report;
      this.parameters = payload.content.parameters;
      this.groupParameters = payload.content.groupParameters;
      if (typeof this.groupParameters === "string") {
        this.groupParameters = this.groupParameters
          .split(",")
          .map(function (value) { return value.trim(); })
          .filter(Boolean);
      }
    }.bind(this));
  }
}

module.exports = StatisticsModel;
