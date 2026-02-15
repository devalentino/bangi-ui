let m = require("mithril");
let StatisticsModel = require("../models/statistics");
let ChartComponent = require("../components/chart");
let { setDefaultDateRange } = require("../utils/date");

const METRIC_KEYS = ["statuses", "clicks", "expenses", "roi_accepted", "roi_expected"];

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value === null || value === undefined || value === "") {
    return 0;
  }

  let numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  return 0;
}

function mergeStatuses(target, source) {
  if (!isPlainObject(source)) {
    return;
  }

  Object.keys(source).forEach(function (status) {
    let entry = source[status] || {};
    if (!target[status]) {
      target[status] = { leads: 0, payouts: 0 };
    }
    target[status].leads += normalizeNumber(entry.leads);
    target[status].payouts += normalizeNumber(entry.payouts);
  });
}

function aggregateNode(node) {
  let result = {
    clicks: 0,
    statuses: {},
    expenses: null,
    roi_accepted: null,
    roi_expected: null,
  };

  if (!isPlainObject(node)) {
    return result;
  }

  let hasExpenses = Object.prototype.hasOwnProperty.call(node, "expenses");
  let hasRoiAccepted = Object.prototype.hasOwnProperty.call(node, "roi_accepted");
  let hasRoiExpected = Object.prototype.hasOwnProperty.call(node, "roi_expected");

  if (Object.prototype.hasOwnProperty.call(node, "clicks")) {
    result.clicks += normalizeNumber(node.clicks);
  }

  if (Object.prototype.hasOwnProperty.call(node, "statuses")) {
    mergeStatuses(result.statuses, node.statuses);
  }

  if (hasExpenses) {
    result.expenses = normalizeNumber(node.expenses);
  }
  if (hasRoiAccepted) {
    result.roi_accepted = node.roi_accepted;
  }
  if (hasRoiExpected) {
    result.roi_expected = node.roi_expected;
  }

  Object.keys(node).forEach(function (key) {
    if (METRIC_KEYS.includes(key)) {
      return;
    }

    let child = node[key];
    if (!isPlainObject(child)) {
      return;
    }

    let childAgg = aggregateNode(child);
    result.clicks += childAgg.clicks;
    mergeStatuses(result.statuses, childAgg.statuses);

    if (!hasExpenses && childAgg.expenses !== null) {
      result.expenses =
        result.expenses === null ? childAgg.expenses : result.expenses + childAgg.expenses;
    }
  });

  return result;
}

function getReportDates(report) {
  return Object.keys(report || {}).sort();
}

function getStatusLeads(statuses, status) {
  if (!statuses || !statuses[status]) {
    return 0;
  }
  return normalizeNumber(statuses[status].leads);
}

function getStatusPayouts(statuses, status) {
  if (!statuses || !statuses[status]) {
    return 0;
  }
  return normalizeNumber(statuses[status].payouts);
}

function computeRoi(payouts, expenses) {
  let expenseValue = normalizeNumber(expenses);
  if (!expenseValue) {
    return null;
  }
  return ((normalizeNumber(payouts) - expenseValue) / expenseValue) * 100;
}

function getExpectedPayouts(statuses) {
  return (
    getStatusPayouts(statuses, "accept") +
    getStatusPayouts(statuses, "expect")
  );
}

function extractRows(report, groupParameters) {
  let rows = [];
  let dates = getReportDates(report);
  let groupKey = groupParameters && groupParameters.length > 0 ? groupParameters[0] : null;

  dates.forEach(function (date) {
    let node = report[date] || {};

    if (!groupKey) {
      let agg = aggregateNode(node);
      rows.push({
        date: date,
        groupValue: null,
        metrics: agg,
      });
      return;
    }

    if (Object.keys(node).length === 0) {
      return;
    }

    if (METRIC_KEYS.some(function (key) { return Object.prototype.hasOwnProperty.call(node, key); })) {
      let agg = aggregateNode(node);
      rows.push({
        date: date,
        groupValue: null,
        metrics: agg,
      });
      return;
    }

    Object.keys(node).forEach(function (groupValue) {
      let groupNode = node[groupValue];
      let agg = aggregateNode(groupNode);

      rows.push({
        date: date,
        groupValue: groupValue,
        metrics: agg,
      });
    });
  });

  return rows;
}

function getGroupLabels(rows) {
  let labels = [];

  rows.forEach(function (row) {
    let label = row.groupValue || "Total";
    if (!labels.includes(label)) {
      labels.push(label);
    }
  });

  if (labels.length === 0) {
    labels.push("Total");
  }

  return labels;
}

function buildMetricDatasets(rows, dates, metricFn) {
  let labels = getGroupLabels(rows);
  let map = {};

  rows.forEach(function (row) {
    let label = row.groupValue || "Total";
    if (!map[row.date]) {
      map[row.date] = {};
    }
    map[row.date][label] = row.metrics;
  });

  let datasets = {};
  labels.forEach(function (label) {
    datasets[label] = [];
  });

  dates.forEach(function (date) {
    labels.forEach(function (label) {
      let metrics = map[date] && map[date][label] ? map[date][label] : null;
      datasets[label].push(metricFn(metrics));
    });
  });

  return datasets;
}

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

    console.log(this.model.report);
    let dates = getReportDates(this.model.report);
    let rows = extractRows(this.model.report, this.model.groupParameters);
    let clicksDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      return metrics ? metrics.clicks : 0;
    });
    let leadsDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return 0;
      }

      let statuses = metrics.statuses || {};
      return (
        getStatusLeads(statuses, "accept") +
        getStatusLeads(statuses, "expect") +
        getStatusLeads(statuses, "reject") +
        getStatusLeads(statuses, "trash")
      );
    });
    let acceptedLeadsDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return 0;
      }
      return getStatusLeads(metrics.statuses || {}, "accept");
    });
    let acceptedPayoutsDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return 0;
      }
      return getStatusPayouts(metrics.statuses || {}, "accept");
    });
    let expectedPayoutsDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return 0;
      }
      return getExpectedPayouts(metrics.statuses || {});
    });
    let expensesDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return null;
      }
      if (metrics.expenses === null || metrics.expenses === undefined) {
        return null;
      }
      return normalizeNumber(metrics.expenses);
    });
    let roiAcceptedDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return null;
      }
      if (metrics.roi_accepted !== null && metrics.roi_accepted !== undefined) {
        return Number(metrics.roi_accepted);
      }
      return computeRoi(getStatusPayouts(metrics.statuses || {}, "accept"), metrics.expenses);
    });
    let roiExpectedDatasets = buildMetricDatasets(rows, dates, function (metrics) {
      if (!metrics) {
        return null;
      }
      if (metrics.roi_expected !== null && metrics.roi_expected !== undefined) {
        return Number(metrics.roi_expected);
      }
      return computeRoi(getExpectedPayouts(metrics.statuses || {}), metrics.expenses);
    });

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

    acceptedLeadsDatasets = Object.keys(acceptedLeadsDatasets).map(function (
      groupByValue
    ) {
      return {
        label: groupByValue,
        data: acceptedLeadsDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });
    acceptedPayoutsDatasets = Object.keys(acceptedPayoutsDatasets).map(function (
      groupByValue
    ) {
      return {
        label: groupByValue,
        data: acceptedPayoutsDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });
    expectedPayoutsDatasets = Object.keys(expectedPayoutsDatasets).map(function (
      groupByValue
    ) {
      return {
        label: groupByValue,
        data: expectedPayoutsDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });
    expensesDatasets = Object.keys(expensesDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: expensesDatasets[groupByValue],
        fill: true,
        cubicInterpolationMode: "monotone",
      };
    });
    roiAcceptedDatasets = Object.keys(roiAcceptedDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: roiAcceptedDatasets[groupByValue],
        fill: false,
        cubicInterpolationMode: "monotone",
      };
    });
    roiExpectedDatasets = Object.keys(roiExpectedDatasets).map(function (groupByValue) {
      return {
        label: groupByValue,
        data: roiExpectedDatasets[groupByValue],
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

    const acceptedLeadsChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: acceptedLeadsDatasets,
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
    const acceptedPayoutsChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: acceptedPayoutsDatasets,
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
    const expectedPayoutsChartOptions = {
      type: "line",
      data: {
        labels: dates,
        datasets: expectedPayoutsDatasets,
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
        datasets: expensesDatasets,
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
        datasets: roiAcceptedDatasets,
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
        datasets: roiExpectedDatasets,
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
      { id: "accepted-leads", title: "Leads (accepted)", options: acceptedLeadsChartOptions },
      { id: "accepted-payouts", title: "Payouts", options: acceptedPayoutsChartOptions },
      { id: "expected-payouts", title: "Payouts (expected)", options: expectedPayoutsChartOptions },
      { id: "expenses", title: "Expenses", options: expensesChartOptions },
      { id: "roi-accepted", title: "ROI", options: roiAcceptedChartOptions },
      { id: "roi-expected", title: "ROI (expected)", options: roiExpectedChartOptions },
    ];

    let activeTab = this.model.activeChartTab || tabs[0].id;
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
                        this.model.activeChartTab = tab.id;
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
      m(this.tableView),
    ];
  }
}

module.exports = StatisticsView;
