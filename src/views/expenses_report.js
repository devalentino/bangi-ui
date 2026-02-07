const m = require("mithril");
const tabulatorModule = require("tabulator-tables");
const Tabulator =
  tabulatorModule.TabulatorFull || tabulatorModule.default || tabulatorModule;
const api = require("../models/api");
const ExpensesReportModel = require("../models/expenses_report");

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function setDefaultDateRange(model) {
  if (model.filter.start && model.filter.end) {
    return;
  }

  let today = new Date();
  let fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 6);

  model.filter.start = formatDate(fromDate);
  model.filter.end = formatDate(today);
}

function normalizeValue(value) {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  let numeric = Number(value);
  if (!Number.isNaN(numeric) && value !== true && value !== false) {
    return numeric;
  }

  return value;
}

const ExpensesReportTable = {
  oncreate(vnode) {
    const model = vnode.attrs.model;
    const state = vnode.state;
    const table = new Tabulator(vnode.dom, {
      layout: "fitColumns",
      data: model.rows,
      columns: model.columns,
      columnDefaults: {
        headerSort: false,
        widthGrow: 1,
      },
      placeholder: "Select filters to load data.",
    });

    vnode.state.table = table;
    vnode.state.lastVersion = model.tableVersion;
    vnode.state.isSyncing = false;

    table.on("cellEdited", function () {
      if (state.isSyncing) {
        return;
      }

      model.isDirty = true;
      model.rows = table.getData();
      const updated = model.ensureMinimumEmptySpace();

      if (updated) {
        state.isSyncing = true;
        table.setColumns(model.columns || []);
        table.setData(model.rows || []).then(function () {
          state.isSyncing = false;
        });
      }

      m.redraw();
    });

    if (vnode.attrs.onReady) {
      vnode.attrs.onReady(table);
    }
  },
  onupdate(vnode) {
    const model = vnode.attrs.model;
    const table = vnode.state.table;

    if (!table) {
      return;
    }

    if (vnode.state.lastVersion !== model.tableVersion) {
      table.setColumns(model.columns || []);
      table.setData(model.rows || []);
      vnode.state.lastVersion = model.tableVersion;
    }
  },
  onremove(vnode) {
    if (vnode.state.table) {
      vnode.state.table.destroy();
    }
  },
  view() {
    return m("div");
  },
};

class ExpensesReportView {
  constructor() {
    this.model = new ExpensesReportModel();
    this.campaigns = [];
    this.table = null;
    this.isSaving = false;
    this.saveError = null;
    this.saveSuccess = null;
  }

  oninit() {
    setDefaultDateRange(this.model);

    api
      .request({
        method: "GET",
        url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns`,
      })
      .then(function (payload) {
        this.campaigns = payload.content || [];

        if (this.campaigns.length > 0) {
          this.model.filter.campaignId = Number(this.campaigns[0].id);
          this.model.fetch();
        }
      }.bind(this));
  }

  _resetToOriginal() {
    this.model.resetToOriginal();
  }

  _buildSavePayload() {
    const rows = this.table ? this.table.getData() : this.model.rows;
    const headerRow = rows[0] || {};
    const keys = this.model.columnFields
      .map(function (field) {
        const value = headerRow[field];
        return typeof value === "string" ? value.trim() : value;
      })
      .filter(function (value) {
        return value !== null && value !== undefined && value !== "";
      });

    const dates = rows
      .slice(1)
      .filter(function (row) {
        return row.date !== null && row.date !== undefined && row.date !== "";
      })
      .map(
        function (row) {
          const distribution = {};

          keys.forEach(
            function (key, index) {
              const field = this.model.columnFields[index];
              distribution[key] = normalizeValue(row[field]);
            }.bind(this),
          );

          return {
            date: row.date,
            distribution: distribution,
          };
        }.bind(this),
      );

    return {
      campaignId: Number(this.model.filter.campaignId),
      distributionParameter: this.model.distributionParameter,
      dates: dates,
    };
  }

  _saveReport() {
    if (!this.model.distributionParameter) {
      this.saveError = "Distribution parameter is required for saving.";
      this.saveSuccess = null;
      return;
    }

    this.isSaving = true;
    this.saveError = null;
    this.saveSuccess = null;

    api
      .request({
        method: "POST",
        url: `${process.env.BACKEND_API_BASE_URL}/reports/expenses`,
        body: this._buildSavePayload(),
      })
      .then(function () {
        this.isSaving = false;
        this.saveSuccess = "Report saved.";
        this.model.originalRows = JSON.parse(
          JSON.stringify(this.table ? this.table.getData() : this.model.rows),
        );
        this.model.originalColumns = JSON.parse(
          JSON.stringify(this.model.columns),
        );
        this.model.originalColumnFields = JSON.parse(
          JSON.stringify(this.model.columnFields),
        );
        this.model.isDirty = false;
      }.bind(this))
      .catch(function () {
        this.isSaving = false;
        this.saveError = "Failed to save report.";
      }.bind(this));
  }

  view() {
    return m(
      ".container-fluid.pt-4.px-4",
      [
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
                    value: this.model.filter.start || "",
                    oninput: function (event) {
                      this.model.filter.start = event.target.value;
                      this.model.fetch();
                    }.bind(this),
                  }),
                ),
                m(
                  ".col-12",
                  m("input.form-control", {
                    type: "date",
                    value: this.model.filter.end || "",
                    oninput: function (event) {
                      this.model.filter.end = event.target.value;
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
                      this.model.filter.campaignId = Number(event.target.value);
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
                m("h6.mb-0", "Report Actions"),
              ),
              m(".mb-3", [
                m("label.form-label", "Distribution Parameter"),
                m("input.form-control", {
                  type: "text",
                  value: this.model.distributionParameter,
                  placeholder: "Enter distribution parameter",
                  oninput: function (event) {
                    this.model.distributionParameter = event.target.value;
                    this.saveError = null;
                    this.saveSuccess = null;
                  }.bind(this),
                }),
              ]),
              m(".d-flex.flex-column.gap-2", [
                m(
                  "button.btn.btn-primary",
                  {
                    type: "button",
                    disabled: this.isSaving || !this.model.filter.isReady(),
                    onclick: function () {
                      this._saveReport();
                    }.bind(this),
                  },
                  this.isSaving ? "Saving..." : "Save Report",
                ),
                m(
                  "button.btn.btn-outline-secondary",
                  {
                    type: "button",
                    disabled: !this.model.isDirty,
                    onclick: function () {
                      this._resetToOriginal();
                    }.bind(this),
                  },
                  "Reset",
                ),
              ]),
              this.saveError
                ? m("div.text-danger.mt-2", this.saveError)
                : null,
              this.saveSuccess
                ? m("div.text-success.mt-2", this.saveSuccess)
                : null,
            ]),
          ),
        ]),
        m(".row.g-4.mt-1", [
          m(".col-12", [
            m(".bg-light.rounded.p-4", [
              m(
                ".d-flex.align-items-center.justify-content-between.mb-3",
                m("h6.mb-0", "Expenses Report"),
              ),
              this.model.error
                ? m("div.text-danger.mb-3", this.model.error)
                : null,
              this.model.isLoading
                ? m("div.mb-3", "Loading report...")
                : null,
              m(ExpensesReportTable, {
                model: this.model,
                onReady: function (table) {
                  this.table = table;
                }.bind(this),
              }),
            ]),
          ]),
        ]),
      ],
    );
  }
}

module.exports = ExpensesReportView;
