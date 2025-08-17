var m = require("mithril");
var config = require("../config");
var auth = require("../models/auth");
var statisticsModel = require("../models/statistics");
var ChartComponent = require("../components/chart");

var filterAvailableCampaigns = [];

function getLeadsCount(row, status) {
  if (row.hasOwnProperty("leads")) {
    if (row.leads.hasOwnProperty(status)) {
      return row.leads[status];
    }
  }

  return 0;
}

var Filter = {
  oninit: function () {
    m.request({
      method: "GET",
      url: `${config.BACKEND_API_BASE_URL}/core/campaigns`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
    }).then(function (payload) {
      filterAvailableCampaigns = payload;

      if (filterAvailableCampaigns.length > 0) {
        statisticsModel.filter.campaign_id = filterAvailableCampaigns[0].id;
      }
    });
  },
  view: function () {
    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(
          ".col-sm-12.col-md-6.col-xl-4",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "From"),
            ),
            m("input.form-control", {
              type: "date",
              oninput: function (event) {
                statisticsModel.filter.from = event.target.value;
                statisticsModel.fetch();
              },
            }),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-4",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "To"),
            ),
            m("input.form-control", {
              type: "date",
              oninput: function (event) {
                statisticsModel.filter.to = event.target.value;
                statisticsModel.fetch();
              },
            }),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-4",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "Campaign"),
            ),
            m(
              ".d-flex.mb-2",
              m(
                "select.form-select.mb-3",
                {
                  "aria-label": "Campaign",
                  oninput: function (event) {
                    statisticsModel.filter.campaign_id = event.target.value;
                    statisticsModel.fetch();
                  },
                  value: statisticsModel.filter.campaign_id,
                },
                filterAvailableCampaigns.map(function (campaign) {
                  return m("option", { value: campaign.id }, campaign.name);
                }),
              ),
            ),
          ]),
        ),
      ]),
    );
  },
};

var Chart = {
  view: function () {
    if (statisticsModel.report === null) return;

    var days = [];
    var clicks = [];

    for (const key in statisticsModel.report) {
      if (statisticsModel.report.hasOwnProperty(key)) {
        days.push(key);
        clicks.push(statisticsModel.report[key]["clicks"]);
      }
    }

    var chartOptions = {
      type: "line",
      data: {
        labels: days,
        datasets: [
          {
            label: "Clicks",
            data: clicks,
            backgroundColor: "rgba(0, 156, 255, .5)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
      },
    };

    return m(
      "div.container-fluid.pt-4.px-4",
      m(
        "div.row.g-4",
        m(
          "div.col-12",
          m("div.bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", "Statistics Chart"),
            m(ChartComponent, { chartOptions }),
          ]),
        ),
      ),
    );
  },
};

var Table = {
  _build_trs: function (report) {
    var trs = [];
    for (const key in report) {
      if (report.hasOwnProperty(key)) {
        var row = report[key];

        trs.push(
          m("tr", [
            m("td", key), // date
            m("td", row.clicks),
            m("td", getLeadsCount(row, "expect")),
            m("td", getLeadsCount(row, "accept")),
            m("td", getLeadsCount(row, "reject")),
            m("td", getLeadsCount(row, "trash")),
          ]),
        );
      }
    }
    return trs;
  },
  view: function () {
    if (statisticsModel.report === null) return;

    return m(
      "div.container-fluid.pt-4.px-4",
      m(
        "div.row.g-4",
        m(
          "div.col-12",
          m("div.bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", "Statistics Table"),
            m(
              "div.table-responsive",
              m("table.table", [
                m(
                  "thead",
                  m("tr", [
                    m("th", { scope: "col" }, "Date"),
                    m("th", { scope: "col" }, "Clicks"),
                    m("th", { scope: "col" }, "Expect"),
                    m("th", { scope: "col" }, "Accept"),
                    m("th", { scope: "col" }, "Reject"),
                    m("th", { scope: "col" }, "Trash"),
                  ]),
                ),
                m("tbody", Table._build_trs(statisticsModel.report)),
              ]),
            ),
          ]),
        ),
      ),
    );
  },
};

var Statistics = {
  view: function () {
    return [m(Filter), m(Chart), m(Table)];
  },
};

module.exports = Statistics;
