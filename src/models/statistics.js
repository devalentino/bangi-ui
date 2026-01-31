const m = require("mithril");

class StatisticsFilter {
  constructor() {
    this.from = null;
    this.to = null;
    this.campaignId = null;
    this.groupBy = null;
  }

  isReady() {
    return this.from !== null && this.to !== null && this.campaignId !== null;
  }

  periodStart() {
    return Math.trunc(Date.parse(this.from) / 1000);
  }

  periodEnd() {
    return Math.trunc(Date.parse(this.to) / 1000);
  }
}

class StatisticsModel {
  constructor(auth) {
    this.auth = auth;
    this.filter = new StatisticsFilter();
    this.report = null;
    this.parameters = null;
  }

  fetch() {
    if (!this.filter.isReady()) {
      return;
    }

    var parameters = {
      periodStart: this.filter.periodStart(),
      periodEnd: this.filter.periodEnd(),
      campaignId: this.filter.campaignId,
    };

    if (this.filter.groupBy) {
      parameters.groupParameters = this.filter.groupBy;
    }

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/reports/base`,
      headers: { Authorization: `Basic ${this.auth.token}` },
      params: parameters,
    }).then(function (payload) {
      this.report = payload.content.report;
      this.parameters = payload.content.parameters;
    }.bind(this));
  }
}

module.exports = StatisticsModel;
