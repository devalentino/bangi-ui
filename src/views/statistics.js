let m = require("mithril");
let StatisticsModel = require("../models/statistics");
let ChartComponent = require("../components/chart");
let ChartUtils = require("../utils/chart");
let { setDefaultDateRange } = require("../utils/date");

class FilterView {
  constructor(model) {
    this.model = model;
  }

  oninit() {
    setDefaultDateRange(this.model.filter, "periodStart", "periodEnd");
    this.model.initialize();
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
                    value: this.model.filter.periodStart || "",
                    oninput: function (event) {
                      this.model.filter.periodStart = event.target.value;
                      this.model.loadStatisticsReport();
                    }.bind(this),
                  }),
                ),
              m(
                ".col-12",
                  m("input.form-control", {
                    type: "date",
                    value: this.model.filter.periodEnd || "",
                    oninput: function (event) {
                      this.model.filter.periodEnd = event.target.value;
                      this.model.loadStatisticsReport();
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
                    this.model.loadStatisticsReport();
                  }.bind(this),
                  value: this.model.filter.campaignId,
                },
                this.model.campaigns.map(function (campaign) {
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
                    this.model.loadStatisticsReport();
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

class ChartView {
  constructor(model) {
    this.model = model;
  }

  view() {
    if (this.model.report === null) return;

    let model = this.model;

    let dates = Object.keys(model.report || {}).sort();
    let clicks = Object.values(model.report).map(function (stats) {
      return ChartUtils.getClicks(stats, model.groupParameters);
    });

    let leads = Object.values(model.report).map(function (stats) {
      return ChartUtils.getLeads(stats, model.groupParameters);
    });
    let leadsAccepted = Object.values(model.report).map(function (stats) {
      return ChartUtils.getLeads(stats, model.groupParameters, 'accept');
    });
    let payoutsAccepted = Object.values(model.report).map(function (stats) {
      return ChartUtils.getPayouts(stats, model.groupParameters, false);
    });
    let payoutsExpected = Object.values(model.report).map(function (stats) {
      return ChartUtils.getPayouts(stats, model.groupParameters, true);
    });
    let expenses = Object.values(model.report).map(function (stats) {
      return ChartUtils.getExpenses(stats);
    });
    let roiAccepted = payoutsAccepted.map(function (payout, i) {
      let expense = expenses[i];
      return ChartUtils.getRoi(payout, expense);
    });
    let roiExpected = payoutsExpected.map(function (payout, i) {
      let expense = expenses[i];
      return ChartUtils.getRoi(payout, expense);
    });

    const clicksChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(clicks, "Clicks"),
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
        datasets: ChartUtils.distribution2ChartJsDataset(leads, "Leads"),
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

    const leadsAcceptedChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(leadsAccepted, "Leads Accepted"),
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

    const payoutsAcceptedChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(payoutsAccepted, "Payouts"),
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

    const payoutsExpectedChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(payoutsExpected, "Payouts (expected)"),
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

    const expensesChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(expenses, "Expenses"),
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

    const roiAcceptedChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(roiAccepted, "ROI"),
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

    const roiExpectedChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: ChartUtils.distribution2ChartJsDataset(roiExpected, "ROI (expected)"),
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

    let tabs = [
      { id: "clicks", title: "Clicks", options: clicksChartOptions },
      { id: "leads", title: "Leads", options: leadsChartOptions },
      { id: "accepted-leads", title: "Leads (accepted)", options: leadsAcceptedChartOptions },
      { id: "accepted-payouts", title: "Payouts", options: payoutsAcceptedChartOptions },
      { id: "expected-payouts", title: "Payouts (expected)", options: payoutsExpectedChartOptions },
      { id: "expenses", title: "Expenses", options: expensesChartOptions },
      { id: "roi-accepted", title: "ROI", options: roiAcceptedChartOptions },
      { id: "roi-expected", title: "ROI (expected)", options: roiExpectedChartOptions },
    ];

    let activeTab = model.activeChartTab || tabs[0].id;
    let active = tabs.find(function (tab) { return tab.id === activeTab; }) || tabs[0];

    return m(
      "div.container-fluid.pt-4.px-4",
      m("div.row.g-4",
        m("div.col-12",
          m("div.bg-light.rounded.h-100.p-4", [
            m("ul.nav.nav-tabs.mb-3", { role: "tablist" },
              tabs.map(function (tab) {
                let isActive = tab.id === active.id;
                return m("li.nav-item", { role: "presentation" },
                  m(
                    "button.nav-link",
                    {
                      type: "button",
                      class: isActive ? "active" : "",
                      role: "tab",
                      onclick: function () {
                        model.activeChartTab = tab.id;
                      },
                    },
                    tab.title
                  )
                );
              })
            ),
            m("div.tab-content",
              m("div.tab-pane.fade.show.active", { role: "tabpanel" }, [
                m("h6.mb-4", active.title),
                m(ChartComponent, { chartOptions: active.options }),
              ])
            ),
          ])
        )
      )
    );
  }
}

class TableView {
  constructor(model) {
    this.model = model;
  }

  _buildTrs(report, groupByKey) {
    let trs = [];
    report.forEach(function (row) {
      let statuses = row.statuses || {};
      let dateLevel = row.dateLevel || {};
      let expenses =
        groupByKey !== null
          ? dateLevel.expenses
          : row.expenses;
      let expensesLabel =
        expenses === null || expenses === undefined
          ? "—"
          : (function () {
              let value = Number(expenses);
              return Number.isFinite(value) ? value.toFixed(2) : "—";
            })();
      let roiAccepted =
        groupByKey !== null
          ? dateLevel.roi_accepted
          : row.roi_accepted;
      let roiExpected =
        groupByKey !== null
          ? dateLevel.roi_expected
          : row.roi_expected;

      if (roiAccepted === null || roiAccepted === undefined) {
        if (groupByKey !== null) {
          roiAccepted = computeRoi(
            getStatusPayouts(dateLevel.statuses || {}, "accept"),
            expenses
          );
        } else {
          roiAccepted = computeRoi(getStatusPayouts(statuses, "accept"), expenses);
        }
      }
      if (roiExpected === null || roiExpected === undefined) {
        if (groupByKey !== null) {
          roiExpected = computeRoi(
            getStatusPayouts(dateLevel.statuses || {}, "accept") +
              getStatusPayouts(dateLevel.statuses || {}, "expect"),
            expenses
          );
        } else {
          roiExpected = computeRoi(
            getStatusPayouts(statuses, "accept") + getStatusPayouts(statuses, "expect"),
            expenses
          );
        }
      }

      trs.push(
        m("tr", [
          ...(groupByKey === null || row.isDateHead
            ? [m("td", groupByKey !== null ? { rowspan: row.rowspan } : {}, row.date)]
            : []),
          ...(groupByKey !== null ? [m("td", row[groupByKey])] : []),
          m("td", row.clicks),
          m("td", getStatusLeads(statuses, "accept")),
          m("td", getStatusLeads(statuses, "expect")),
          m("td", getStatusLeads(statuses, "reject")),
          m("td", getStatusLeads(statuses, "trash")),
          m("td", getStatusPayouts(statuses, "accept")),
          m("td", getStatusPayouts(statuses, "expect")),
          ...(groupByKey === null || row.isDateHead
            ? [m("td", groupByKey !== null ? { rowspan: row.rowspan } : {}, expensesLabel)]
            : []),
          ...(groupByKey === null || row.isDateHead
            ? [
                m(
                  "td",
                  groupByKey !== null ? { rowspan: row.rowspan } : {},
                  roiAccepted === null || roiAccepted === undefined
                    ? "—"
                    : (function () {
                        let value = Number(roiAccepted);
                        return Number.isFinite(value) ? value.toFixed(2) : "—";
                      })()
                ),
              ]
            : []),
          ...(groupByKey === null || row.isDateHead
            ? [
                m(
                  "td",
                  groupByKey !== null ? { rowspan: row.rowspan } : {},
                  roiExpected === null || roiExpected === undefined
                    ? "—"
                    : (function () {
                        let value = Number(roiExpected);
                        return Number.isFinite(value) ? value.toFixed(2) : "—";
                      })()
                ),
              ]
            : []),
        ]),
      );
    });
    return trs;
  }

  view() {
    let model = this.model;
    if (model.report === null) return;

    let groupByKey =
      model.groupParameters && model.groupParameters.length > 0
        ? model.groupParameters[0]
        : model.filter.groupBy;
    let rows = extractRows(model.report, model.groupParameters);

    rows.sort(function (a, b) {
      if (a.date === b.date) {
        return String(a.groupValue || "").localeCompare(String(b.groupValue || ""));
      }
      return String(a.date).localeCompare(String(b.date));
    });

    let grouped = rows.map(function (row) {
      let groupValueLabel = row.groupValue === null ? "Total" : row.groupValue;
      let dateLevelMetrics = aggregateNode(model.report[row.date] || {});
      return {
        date: row.date,
        clicks: row.metrics.clicks,
        statuses: row.metrics.statuses || {},
        expenses: row.metrics.expenses,
        roi_accepted: row.metrics.roi_accepted,
        roi_expected: row.metrics.roi_expected,
        dateLevel: {
          statuses: dateLevelMetrics.statuses || {},
          expenses: dateLevelMetrics.expenses,
          roi_accepted: dateLevelMetrics.roi_accepted,
          roi_expected: dateLevelMetrics.roi_expected,
        },
        ...(groupByKey !== null
          ? { [groupByKey]: groupValueLabel }
          : {}),
      };
    });

    if (groupByKey !== null) {
      let rowsPerDate = {};
      grouped.forEach(function (row) {
        rowsPerDate[row.date] = (rowsPerDate[row.date] || 0) + 1;
      });

      let seenDates = {};
      grouped = grouped.map(function (row) {
        let isDateHead = !seenDates[row.date];
        if (isDateHead) {
          seenDates[row.date] = true;
        }
        return Object.assign({}, row, {
          isDateHead: isDateHead,
          rowspan: rowsPerDate[row.date],
        });
      });
    }

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
                    m("th", {scope: "col"}, "Accept"),
                    m("th", {scope: "col"}, "Expect"),
                    m("th", {scope: "col"}, "Reject"),
                    m("th", {scope: "col"}, "Trash"),
                    m("th", {scope: "col"}, "Payout Accept"),
                    m("th", {scope: "col"}, "Payout Expect"),
                    m("th", {scope: "col"}, "Expenses"),
                    m("th", {scope: "col"}, "ROI Accepted"),
                    m("th", {scope: "col"}, "ROI Expected"),
                  ]),
                ),
                m("tbody", this._buildTrs(grouped, groupByKey)),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

class StatisticsView {
  constructor() {
    this.model = new StatisticsModel();
    this.filterView = new FilterView(this.model);
    this.chartView = new ChartView(this.model);
    this.tableView = new TableView(this.model);
  }

  view() {
    return [
      m(this.filterView),
      m(this.chartView),
      // m(this.tableView),
    ];
  }
}

module.exports = StatisticsView;
