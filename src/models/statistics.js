const m = require("mithril");
const auth = require("./auth");

var   Filter = {
  from: null,
  to: null,
  campaignId: null,
  groupBy: null,

  isReady: function () {
    return (
      Filter.from !== null && Filter.to !== null && Filter.campaignId !== null
    );
  },
  periodStart: function () {
    return Math.trunc(Date.parse(Filter.from) / 1000);
  },
  periodEnd: function () {
    return Math.trunc(Date.parse(Filter.to) / 1000);
  },
};

var Statistics = {
  filter: Filter,
  report: null,
  parameters: null,
  fetch: function () {
    if (!Statistics.filter.isReady()) {
      return;
    }

    var parameters = {
      periodStart: Statistics.filter.periodStart(),
      periodEnd: Statistics.filter.periodEnd(),
      campaignId: Statistics.filter.campaignId,
    }

    if (Statistics.filter.groupBy) {
      parameters.groupBy = Statistics.filter.groupBy;
    }

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/reports/base`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      params: parameters,
    }).then(function (payload) {
      Statistics.report = payload["content"]["report"];
      Statistics.parameters = payload["content"]["parameters"];
    });
  },
};

module.exports = Statistics;
