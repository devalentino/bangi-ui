let m = require("mithril");
let auth = require("../models/auth");
let statisticsModel = require("../models/statistics");
let ChartComponent = require("../components/chart");

let filterAvailableCampaigns = [];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function setDefaultDateRange() {
  if (statisticsModel.filter.from && statisticsModel.filter.to) {
    return;
  }

  let today = new Date();
  let fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  statisticsModel.filter.from = formatDate(fromDate);
  statisticsModel.filter.to = formatDate(today);
}

function getGroupByKeys(report) {
  let keys = [];

  report.forEach(function (row) {
    Object.keys(row).filter(function (key) {
      return !["date", "clicks", "leads", "lead_status"].includes(key);
    }).forEach(function (key) {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
  });

  return keys;
}

function getGroupByValues(report, groupByKeys) {
  let groupByValues = [];

  report.forEach(function (row) {
    groupByKeys.forEach(function (groupByKey) {
      if (row[groupByKey] && !groupByValues.includes(row[groupByKey])) {
        groupByValues.push(row[groupByKey]);
      }
    });
  });

  return groupByValues;
}

function getDays(report) {
  let days = [];

  report.forEach(function (row) {
    if (!days.includes(row.date)) {
      days.push(row.date)
    }
  });

  return days;
}

const Filter = {
  oninit: function () {
    setDefaultDateRange();

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns`,
      headers: {Authorization: `Basic ${auth.Authentication.token}`},
    }).then(function (payload) {
      filterAvailableCampaigns = payload["content"];

      if (filterAvailableCampaigns.length > 0) {
        statisticsModel.filter.campaignId = filterAvailableCampaigns[0].id;
        statisticsModel.fetch();
      }
    });
  },
  view: function () {
    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(
          ".col-sm-12.col-md-6.col-xl-3",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "From"),
            ),
            m("input.form-control", {
              type: "date",
              value: statisticsModel.filter.from || "",
              oninput: function (event) {
                statisticsModel.filter.from = event.target.value;
                statisticsModel.fetch();
              },
            }),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-3",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "To"),
            ),
            m("input.form-control", {
              type: "date",
              value: statisticsModel.filter.to || "",
              oninput: function (event) {
                statisticsModel.filter.to = event.target.value;
                statisticsModel.fetch();
              },
            }),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-3",
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
                    statisticsModel.filter.campaignId = event.target.value;
                    statisticsModel.fetch();
                  },
                  value: statisticsModel.filter.campaignId,
                },
                filterAvailableCampaigns.map(function (campaign) {
                  return m("option", {value: campaign.id}, campaign.name);
                }),
              ),
            ),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-3",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "Group By"),
            ),
            m(
              ".d-flex.mb-2",
              m(
                "select.form-select.mb-3",
                {
                  "aria-label": "Group By",
                  disabled: statisticsModel.parameters === null,
                  oninput: function (event) {
                    statisticsModel.filter.groupBy = event.target.value || null;
                    statisticsModel.fetch();
                  },
                  value: statisticsModel.filter.groupBy || "",
                },
                [
                  m("option", {value: ""}, "Select group"),
                ].concat(
                  (statisticsModel.parameters || []).map(function (parameter) {
                    return m(
                      "option",
                      {value: parameter},
                      parameter,
                    );
                  }),
                ),
              ),
            ),
          ]),
        ),
      ]),
    );
  },
};

const Chart = {
  _getClicksFromReport(report, groupByValue, groupByKeys, date) {
    let clicks = 0;

    if (groupByValue === "Total") {
      for (const row of report) {
        if (row.date !== date) continue;

        clicks += row.clicks;
      }
    } else {
      for (const groupByKey of groupByKeys) {
        for (const row of report) {
          if (row.date !== date) continue;

          if (row.hasOwnProperty(groupByKey) && row[groupByKey] === groupByValue) {
            clicks += row.clicks;
          }
        }
      }
    }

    return clicks;
  },

  _getLeadsFromReport(report, groupByValue, groupByKeys, date) {
    let leads = 0;

    if (groupByValue === "Total") {
      for (const row of report) {
        if (row.date !== date) continue;

        if (row.hasOwnProperty("leads")) {
          leads += row.leads;
        }
      }
    } else {
      for (const groupByKey of groupByKeys) {
        for (const row of report) {
          if (row.date !== date) continue;

          if (row.hasOwnProperty(groupByKey) && row[groupByKey] === groupByValue && row.hasOwnProperty("leads")) {
            leads += row.leads;
          }
        }
      }
    }

    return leads;
  },

  _getClicksDatasets(report, dates) {
    let groupByKeys = getGroupByKeys(report);
    let groupByValues = getGroupByValues(report, groupByKeys);
    let datasets = Object.fromEntries(
      groupByValues.map(function (groupByValue) {
        return [groupByValue, []];
      })
    );

    if (Object.keys(datasets).length === 0) {
      datasets = {"Total": []};
      groupByValues = ["Total"];
    }

    for (const date of dates) {
      for (const groupByValue of groupByValues) {
        datasets[groupByValue].push(
          Chart._getClicksFromReport(report, groupByValue, groupByKeys, date)
        );
      }
    }

    return datasets;
  },

  _getLeadsDatasets(report, dates) {
    let groupByKeys = getGroupByKeys(report);
    let groupByValues = getGroupByValues(report, groupByKeys);
    let datasets = Object.fromEntries(
      groupByValues.map(function (groupByValue) {
        return [groupByValue, []];
      })
    );

    if (Object.keys(datasets).length === 0) {
      datasets = {"Total": []};
      groupByValues = ["Total"];
    }

    for (const date of dates) {
      for (const groupByValue of groupByValues) {
        datasets[groupByValue].push(
          Chart._getLeadsFromReport(report, groupByValue, groupByKeys, date)
        );
      }
    }

    return datasets;
  },

  view: function () {
    if (statisticsModel.report === null) return;

    let dates = getDays(statisticsModel.report);
    let clicksDatasets = Chart._getClicksDatasets(statisticsModel.report, dates);
    let leadsDatasets = Chart._getLeadsDatasets(statisticsModel.report, dates);

    clicksDatasets = Object.keys(clicksDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: clicksDatasets[groupByValue],
        fill: false,
        cubicInterpolationMode: "monotone",
      };
    });

    leadsDatasets = Object.keys(leadsDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: leadsDatasets[groupByValue],
        fill: false,
        cubicInterpolationMode: "monotone",
      };
    });

    const clicksChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: clicksDatasets,
      },
      options: {
        responsive: true,
        plugins: {
          colors: {
            enabled: true,
          },
        },
      },
    };

    const leadsChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: leadsDatasets,
      },
      options: {
        responsive: true,
        plugins: {
          colors: {
            enabled: true,
          },
        },
      },
    };

    return m(
      "div.container-fluid.pt-4.px-4",
      m(
        "div.row.g-4",
        [
          m(
            "div.col-6",
            m("div.bg-light.rounded.h-100.p-4", [
              m("h6.mb-4", "Clicks Chart"),
              m(ChartComponent, {chartOptions: clicksChartOptions}),
            ]),
          ),
          m(
            "div.col-6",
            m("div.bg-light.rounded.h-100.p-4", [
              m("h6.mb-4", "Leads Chart"),
              m(ChartComponent, {chartOptions: leadsChartOptions}),
            ]),
          ),
        ],
      ),
    );
  },
};

const Table = {
  _group: function(report, groupByKey, groupByValues, dates) {
    let grouped = {};

    dates.forEach(function(date) {
      if (groupByValues.length > 0) {
        groupByValues.forEach(function (groupByValue) {
          let key = `${date}|${groupByValue}`;

          if (!grouped.hasOwnProperty(key)) {

            grouped[key] = {
              date: date,
              clicks: 0,
              expected: 0,
              approved: 0,
              rejected: 0,
              trash: 0,
            };

            grouped[key][groupByKey] = groupByValue;
          }
        });
      } else {
        grouped[date] = {
          date: date,
          clicks: 0,
          expected: 0,
          approved: 0,
          rejected: 0,
          trash: 0,
        };
      }
    });

    report.forEach(function(row) {
      if (groupByKey && !row.hasOwnProperty(groupByKey)) return;

      let key = groupByKey !== null ? `${row.date}|${row[groupByKey]}` : row.date;

      let leadStatus = row.lead_status || "expected";
      grouped[key]["clicks"] += row.clicks;

      if (row.hasOwnProperty("leads")) {
        grouped[key][leadStatus] = row.leads;
      }

      if (groupByKey !== null) {
        grouped[key][groupByKey] = row[groupByKey];
      }
    });

    return grouped;
  },
  _build_trs: function(report, groupByKey) {
    let trs = [];
    report.forEach(function (row) {
      trs.push(
        m("tr", [
          m("td", row.date),
          ...(groupByKey !== null ? [m("td", row[groupByKey])] : []),
          m("td", row.clicks),
          m("td", row.expected),
          m("td", row.approved),
          m("td", row.rejected),
          m("td", row.trash),
        ]),
      );
    });
    return trs;
  },

  view: function () {
    if (statisticsModel.report === null) return;

    let groupByKeys = getGroupByKeys(statisticsModel.report);
    let groupByValues = getGroupByValues(statisticsModel.report, groupByKeys);
    let groupByKey = groupByKeys.length > 0 ? groupByKeys[0] : null;
    let days = getDays(statisticsModel.report);

    let grouped = this._group(statisticsModel.report, groupByKey, groupByValues, days);

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
                    m("th", {scope: "col"}, "Date"),
                    ...(groupByKey !== null ? [m("th", {scope: "col"}, groupByKey)] : []),
                    m("th", {scope: "col"}, "Clicks"),
                    m("th", {scope: "col"}, "Expected"),
                    m("th", {scope: "col"}, "Approved"),
                    m("th", {scope: "col"}, "Rejected"),
                    m("th", {scope: "col"}, "Trash"),
                  ]),
                ),
                m("tbody", Table._build_trs(Object.values(grouped), groupByKey)),
              ]),
            ),
          ]),
        ),
      ),
    );
  },
};

const Statistics = {
  view: function () {
    return [m(Filter), m(Chart), m(Table)];
  },
};

module.exports = Statistics;
