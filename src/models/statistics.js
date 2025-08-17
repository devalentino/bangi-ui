const m = require("mithril");
const config = require("../config");
const auth = require("./auth");

var Filter = {
  from: null,
  to: null,
  campaign_id: null,

  isReady: function () {
    return (
      Filter.from !== null && Filter.to !== null && Filter.campaign_id !== null
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

    m.request({
      method: "GET",
      url: `${config.BACKEND_API_BASE_URL}/reports/base`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      params: {
        period_start: Statistics.filter.periodStart(),
        period_end: Statistics.filter.periodEnd(),
        campaign_id: Statistics.filter.campaign_id,
      },
    }).then(function (payload) {
      Statistics.report = payload["content"]["report"];
      Statistics.parameters = payload["content"]["parameters"];
    });
  },
};

module.exports = { Statistics };
