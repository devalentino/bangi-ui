const api = require("./api");

class ExpensesReportFilter {
  constructor() {
    this.start = null;
    this.end = null;
    this.campaignId = null;
  }

  isReady() {
    return this.start !== null && this.end !== null && this.campaignId !== null;
  }
}

class ExpensesReportModel {
  constructor() {
    this.filter = new ExpensesReportFilter();
    this.records = [];
    this.matrix = [];
    this.distributionParameter = "";
    this.isLoading = false;
    this.error = null;
  }

  fetch() {
    if (!this.filter.isReady()) {
      return Promise.resolve();
    }

    const startMs = Date.parse(this.filter.start);
    const endMs = Date.parse(this.filter.end);
    let pageSize = 50;

    if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
      const diffDays = Math.floor((endMs - startMs) / 86400000) + 1;
      pageSize = Math.max(1, diffDays);
    }

    this.isLoading = true;
    this.error = null;

    return api
      .request({
        method: "GET",
        url: `${process.env.BACKEND_API_BASE_URL}/reports/expenses`,
        params: {
          start: this.filter.start,
          end: this.filter.end,
          campaignId: this.filter.campaignId,
          page: 1,
          pageSize: pageSize,
          sortBy: "date",
          sortOrder: "asc",
        },
      })
      .then(function (payload) {
        this.records = payload.content;
        this.isLoading = false;
        this._buildTableData();
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load expenses report.";
        this.isLoading = false;
      }.bind(this));
  }

  _buildTableData() {
    const distributionKeySet = new Set();

    this.records.forEach(function (record) {
      const distribution = record.distribution || {};
      Object.keys(distribution).forEach(function (key) {
        distributionKeySet.add(key);
      });
    });

    const distributionKeys = Array.from(distributionKeySet).sort(function (a, b) {
      return a.localeCompare(b);
    });

    const width = distributionKeys.length + 1;

    const headerRow = new Array(width).fill("");
    distributionKeys.forEach(function (key, index) {
      headerRow[index + 1] = key;
    });

    const rows = this.records.map(function (record) {
      const row = new Array(width).fill("");
      row[0] = record.date;

      distributionKeys.forEach(function (key, index) {
          row[index + 1] = record.distribution[key] || "";
      });

      return row;
    });

    this.matrix = [headerRow].concat(rows);

    this._ensureEmptyRows();
    this._ensureEmptyColumns();
  }

  _isRowEmpty(row) {
    return row.every(function (value) {
      return value === null || value === undefined || value === "";
    });
  }

  _ensureEmptyRows() {
    let emptyTrailingRows = 0;

    for (let i = this.matrix.length - 1; i < this.matrix.length - 3; i -= 1) {
      if (this._isRowEmpty(this.matrix[i])) {
        emptyTrailingRows += 1;
      } else {
        break;
      }
    }

    while (emptyTrailingRows < 2) {
      const row = new Array(this.matrix[0].length).fill("");
      this.matrix.push(row);
      emptyTrailingRows += 1;
    }
  }

  _ensureEmptyColumns() {
    const headerRow = this.matrix[0];
    let trailingEmptyColumns = 0;

    for (let i = headerRow.length - 1; i < headerRow.matrix.length - 3; i -= 1) {
      if (headerRow[i] === null || headerRow[i] === undefined || headerRow[i] === "") {
        trailingEmptyColumns += 1;
      }  else {
        break;
      }
    }

    if (trailingEmptyColumns >= 2) {
      return;
    }

    const needed = 2 - trailingEmptyColumns;

    this.matrix.forEach(function (row) {
      for (let i = 0; i < needed; i += 1) {
        row.push("");
      }
    });
  }

  ensureMinimumEmptySpace() {
    const previousColumnCount = this.matrix[0].length;
    const previousRowCount = this.matrix.length;

    this._ensureEmptyColumns();
    this._ensureEmptyRows();

    return (
      previousColumnCount !== this.matrix[0].length ||
      previousRowCount !== this.matrix.length
    );
  }

  resetToOriginal() {
    this._buildTableData();
  }
}

module.exports = ExpensesReportModel;
