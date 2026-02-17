let m = require("mithril");
let StatisticsModel = require("../models/statistics");
let ChartComponent = require("../components/chart");
let ChartUtils = require("../utils/chart");
let {setDefaultDateRange} = require("../utils/date");

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
                  return m("option", {value: campaign.id}, campaign.name);
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
                  m("option", {value: ""}, "Select group"),
                ].concat(
                  (this.model.parameters || []).map(function (parameter) {
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
      {id: "clicks", title: "Clicks", options: clicksChartOptions},
      {id: "leads", title: "Leads", options: leadsChartOptions},
      {id: "accepted-leads", title: "Leads (accepted)", options: leadsAcceptedChartOptions},
      {id: "accepted-payouts", title: "Payouts", options: payoutsAcceptedChartOptions},
      {id: "expected-payouts", title: "Payouts (expected)", options: payoutsExpectedChartOptions},
      {id: "expenses", title: "Expenses", options: expensesChartOptions},
      {id: "roi-accepted", title: "ROI", options: roiAcceptedChartOptions},
      {id: "roi-expected", title: "ROI (expected)", options: roiExpectedChartOptions},
    ];

    let activeTab = model.activeChartTab || tabs[0].id;
    let active = tabs.find(function (tab) {
      return tab.id === activeTab;
    }) || tabs[0];

    return m(
      "div.container-fluid.pt-4.px-4",
      m("div.row.g-4",
        m("div.col-12",
          m("div.bg-light.rounded.h-100.p-4", [
            m("ul.nav.nav-tabs.mb-3", {role: "tablist"},
              tabs.map(function (tab) {
                let isActive = tab.id === active.id;
                return m("li.nav-item", {role: "presentation"},
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
              m("div.tab-pane.fade.show.active", {role: "tabpanel"}, [
                m("h6.mb-4", active.title),
                m(ChartComponent, {chartOptions: active.options}),
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

  _distributionValuesCount(statisticsContainer) {
    if (Object.hasOwn(statisticsContainer, "statuses")) {
      return 1;
    }

    let keysCount = 0;

    for (const stats of Object.values(statisticsContainer)) {
      if (stats !== null && typeof stats === "object") {
        keysCount += this._distributionValuesCount(stats);
      }
    }

    return keysCount;
  }

  _buildTrs(statisticsContainer, groupParameters, trs, context) {
    if (groupParameters.length === 0) {
      let tds = [
        ...context.existing.map(function (value) {
          return m("td", value)
        }),
        m("td", statisticsContainer.clicks),
        m("td", statisticsContainer.statuses.accept.leads),
        m("td", statisticsContainer.statuses.expect.leads),
        m("td", statisticsContainer.statuses.reject.leads),
        m("td", statisticsContainer.statuses.trash.leads),
        m("td", statisticsContainer.statuses.accept.payouts),
        m("td", statisticsContainer.statuses.accept.payouts + statisticsContainer.statuses.accept.payouts),
      ];

      if (Object.hasOwn(statisticsContainer, "expenses")) {
        tds.push(m("td", statisticsContainer.expenses));
        tds.push(m("td", statisticsContainer.roi_accepted));
        tds.push(m("td", statisticsContainer.roi_expected));
      } else if (context.distributionValuesCount > 0) {
        tds.push(m("td", {rowspan: context.distributionValuesCount}, context.expenses));
        tds.push(m("td", {rowspan: context.distributionValuesCount}, context.roiAccepted));
        tds.push(m("td", {rowspan: context.distributionValuesCount}, context.roiExpected));

        context.distributionValuesCount = 0;
      }

      trs.push(m("tr", tds));
      context.existing.pop();

      return;
    }

    for (const distributionValue of Object.keys(statisticsContainer)) {
      if (distributionValue === "expenses") {
        context.distributionValuesCount = this._distributionValuesCount(statisticsContainer);
        context.expenses = statisticsContainer.expenses;
        context.roiAccepted = statisticsContainer.roi_accepted;
        context.roiExpected = statisticsContainer.roi_expected;
        break;
      }
    }

    for (const [distributionValue, stats] of Object.entries(statisticsContainer)) {
      if (groupParameters[0] === "date") {
        context.existing = [];
      }

      if (stats !== null && typeof stats === "object") {
        context.existing.push(distributionValue);

        this._buildTrs(stats, groupParameters.slice(1), trs, context);
      }
    }
  }

  view() {
    let model = this.model;
    if (model.report === null) return;

    let groupByThs = [];
    for (const groupParameter of model.groupParameters) {
      groupByThs.push(m("th", {scope: "col"}, groupParameter));
    }

    let trs = [];
    let context = {existing: [], distributionValuesCount: 0, expenses: 0, roiAccepted: 0, roiExpected: 0};
    this._buildTrs(model.report, ["date"].concat(model.groupParameters), trs, context);

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
                    ...groupByThs,
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
                m("tbody", trs),
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
      m(this.tableView),
    ];
  }
}

module.exports = StatisticsView;
