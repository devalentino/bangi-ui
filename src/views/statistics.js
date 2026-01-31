let m = require("mithril");
let StatisticsModel = require("../models/statistics");
let ChartComponent = require("../components/chart");

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function setDefaultDateRange(model) {
  if (model.filter.from && model.filter.to) {
    return;
  }

  let today = new Date();
  let fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  model.filter.from = formatDate(fromDate);
  model.filter.to = formatDate(today);
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

class FilterView {
  constructor(vnode) {
    this.model = vnode.attrs.model;
    this.auth = vnode.attrs.auth;
    this.campaigns = [];
  }

  oninit() {
    setDefaultDateRange(this.model);

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns`,
      headers: { Authorization: `Basic ${this.auth.token}` },
    }).then(function (payload) {
      this.campaigns = payload.content || [];

      if (this.campaigns.length > 0) {
        this.model.filter.campaignId = this.campaigns[0].id;
        this.model.fetch();
      }
    }.bind(this));
  }

  view() {
    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(
          ".col-sm-12.col-md-6.col-xl-4",
          m(".h-100.bg-light.rounded.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              m("h6.mb-0", "Date Range"),
            ),
            m(".row.g-2", [
              m(
                ".col-12",
                m("input.form-control", {
                  type: "date",
                  value: this.model.filter.from || "",
                  oninput: function (event) {
                    this.model.filter.from = event.target.value;
                    this.model.fetch();
                  }.bind(this),
                }),
              ),
              m(
                ".col-12",
                m("input.form-control", {
                  type: "date",
                  value: this.model.filter.to || "",
                  oninput: function (event) {
                    this.model.filter.to = event.target.value;
                    this.model.fetch();
                  }.bind(this),
                }),
              ),
            ]),
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
                    this.model.filter.campaignId = event.target.value;
                    this.model.fetch();
                  }.bind(this),
                  value: this.model.filter.campaignId,
                },
                this.campaigns.map(function (campaign) {
                  return m("option", { value: campaign.id }, campaign.name);
                }),
              ),
            ),
          ]),
        ),
        m(
          ".col-sm-12.col-md-6.col-xl-4",
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
                  disabled: this.model.parameters === null,
                  oninput: function (event) {
                    this.model.filter.groupBy = event.target.value || null;
                    this.model.fetch();
                  }.bind(this),
                  value: this.model.filter.groupBy || "",
                },
                [
                  m("option", { value: "" }, "Select group"),
                ].concat(
                  (this.model.parameters || []).map(function (parameter) {
                    return m(
                      "option",
                      { value: parameter },
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
  }
}

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

  _getLeadsFromReport(report, groupByValue, groupByKeys, date, leadStatus) {
    let leads = 0;
    let status = leadStatus ? String(leadStatus).toLowerCase() : null;

    if (groupByValue === "Total") {
      for (const row of report) {
        if (row.date !== date) continue;

        if (row.hasOwnProperty("leads") && matchesLeadStatus(row, status)) {
          leads += row.leads;
        }
      }
    } else {
      for (const groupByKey of groupByKeys) {
        for (const row of report) {
          if (row.date !== date) continue;

          if (
            row.hasOwnProperty(groupByKey) &&
            row[groupByKey] === groupByValue &&
            row.hasOwnProperty("leads") &&
            matchesLeadStatus(row, status)
          ) {
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

  _getLeadsDatasets(report, dates, leadStatus) {
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
          Chart._getLeadsFromReport(
            report,
            groupByValue,
            groupByKeys,
            date,
            leadStatus
          )
        );
      }
    }

    return datasets;
  },

  view: function (vnode) {
    let model = vnode.attrs.model;
    if (model.report === null) return;

    let dates = getDays(model.report);
    let clicksDatasets = Chart._getClicksDatasets(model.report, dates);
    let leadsDatasets = Chart._getLeadsDatasets(model.report, dates);
    let approvedLeadsDatasets = Chart._getLeadsDatasets(
      model.report,
      dates,
      "approved"
    );

    clicksDatasets = Object.keys(clicksDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: clicksDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });

    leadsDatasets = Object.keys(leadsDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: leadsDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });

    approvedLeadsDatasets = Object.keys(approvedLeadsDatasets).map(function (
      groupByValue
    ) {
      return {
        label: groupByValue,
        data: approvedLeadsDatasets[groupByValue],
        fill: true,
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

    const approvedLeadsChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: approvedLeadsDatasets,
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

    return [
      m(
        "div.container-fluid.pt-4.px-4",
        m(
          "div.row.g-4",
          [
            m(
              "div.col-12.col-md-6.col-xl-6",
              m("div.bg-light.rounded.h-100.p-4", [
                m("h6.mb-4", "Clicks"),
                m(ChartComponent, {chartOptions: clicksChartOptions}),
              ]),
            ),
            m(
              "div.col-12.col-md-6.col-xl-6",
              m("div.bg-light.rounded.h-100.p-4", [
                m("h6.mb-4", "Leads"),
                m(ChartComponent, {chartOptions: leadsChartOptions}),
              ]),
            ),
          ],
        ),
      ),
      m("div.container-fluid.pt-4.px-4",
        m(
          "div.row.g-4",
          [
            m(
              "div.col-12.col-md-6.col-xl-6",
              m("div.bg-light.rounded.h-100.p-4",
                [
                  m("h6.mb-4", "Approved Leads"),
                  m(ChartComponent, {chartOptions: approvedLeadsChartOptions}),
                ]
              ),
            ),
          ]
        )
      )
    ]
  },
};

const Table = {
  _group: function (report, groupByKey, groupByValues, dates) {
    let grouped = {};

    dates.forEach(function (date) {
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

    report.forEach(function (row) {
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
  _build_trs: function (report, groupByKey) {
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

  view: function (vnode) {
    let model = vnode.attrs.model;
    if (model.report === null) return;

    let groupByKeys = getGroupByKeys(model.report);
    let groupByValues = getGroupByValues(model.report, groupByKeys);
    let groupByKey = groupByKeys.length > 0 ? groupByKeys[0] : null;
    let days = getDays(model.report);

    let grouped = this._group(model.report, groupByKey, groupByValues, days);

    return m(
      "div.container-fluid.pt-4.px-4",
      m(
        "div.row.g-4",
        m(
          "div.col-12",
          m("div.bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", "Statistics"),
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

class StatisticsView {
  constructor(vnode) {
    this.auth = vnode.attrs.auth;
    this.model = new StatisticsModel(this.auth);
  }

  view() {
    return [
      m(FilterView, { model: this.model, auth: this.auth }),
      m(Chart, { model: this.model }),
      m(Table, { model: this.model }),
    ];
  }
}

function matchesLeadStatus(row, leadStatus) {
  if (!leadStatus) return true;

  return String(row.lead_status || "").toLowerCase() === leadStatus;
}

module.exports = StatisticsView;
