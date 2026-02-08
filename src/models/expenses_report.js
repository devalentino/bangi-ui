const api = require("./api");

class ExpensesReportFilter {
  constructor() {
    this.periodStart = null;
    this.periodEnd = null;
    this.campaignId = null;
  }

  isReady() {
    return (
      this.periodStart !== null &&
      this.periodEnd !== null &&
      this.campaignId !== null
    );
  }
}

class ExpensesReportModel {
  constructor() {
    this.filter = new ExpensesReportFilter();
    this.records = [];
    this.matrix = null;
    this.distributionParameter = "";
    this.isLoading = false;
    this.error = null;
  }

  fetch() {
    if (!this.filter.isReady()) {
      return Promise.resolve();
    }

    const startMs = Date.parse(this.filter.periodStart);
    const endMs = Date.parse(this.filter.periodEnd);
    let pageSize = 1;

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
          periodStart: this.filter.periodStart,
          periodEnd: this.filter.periodEnd,
          campaignId: this.filter.campaignId,
          page: 1,
          pageSize: pageSize,
          sortBy: "date",
          sortOrder: "asc",
        },
      })
      .then(function (payload) {
        const content = Array.isArray(payload.content)
          ? payload.content
          : (payload.content && payload.content.content) || [];

        this.records = content || [];
        this.isLoading = false;
        this._buildMatrix();
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load expenses report.";
        this.isLoading = false;
      }.bind(this));
  }

  _buildMatrix() {
    const distributionKeySet = new Set();

    this.records.forEach(function (record) {
      const distribution = record.distribution || {};
      Object.keys(distribution).forEach(function (key) {
        distributionKeySet.add(key);
      });
    });

    const distributionKeys = Array.from(distributionKeySet).sort(function (
      a,
      b,
    ) {
      return a.localeCompare(b);
    });

    const width = Math.max(1, distributionKeys.length + 1);

    const headerRow = new Array(width).fill("");
    distributionKeys.forEach(function (key, index) {
      headerRow[index + 1] = key;
    });

    const rows = this.records.map(function (record) {
      const row = new Array(width).fill("");
      row[0] = record.date || "";

      const distribution = record.distribution || {};
      distributionKeys.forEach(function (key, index) {
        if (Object.prototype.hasOwnProperty.call(distribution, key)) {
          row[index + 1] = distribution[key];
        }
      });

      return row;
    });

    this.matrix = [headerRow].concat(rows);

    this._ensureEmptyRows();
    this._ensureEmptyColumns();
  }

  _isRowEmpty(row) {
    if (!row) {
      return true;
    }

    return row.every(function (value) {
      return value === null || value === undefined || value === "";
    });
  }

  _ensureEmptyRows() {
    let emptyTrailingRows = 0;

    for (let i = this.matrix.length - 1; i >= 1 && emptyTrailingRows < 2; i -= 1) {
      if (this._isRowEmpty(this.matrix[i])) {
        emptyTrailingRows += 1;
      } else {
        break;
      }
    }

    while (emptyTrailingRows < 2) {
      const row = new Array(this._matrixColumnCount()).fill("");
      this.matrix.push(row);
      emptyTrailingRows += 1;
    }
  }

  _ensureEmptyColumns() {
    if (this.matrix.length === 0) {
      this.matrix = [new Array(1).fill("")];
    }

    const headerRow = this.matrix[0] || [];
    let trailingEmptyColumns = 0;

    for (let i = headerRow.length - 1; i >= 1 && trailingEmptyColumns < 2; i -= 1) {
      const value = headerRow[i];
      if (value === null || value === undefined || value === "") {
        trailingEmptyColumns += 1;
      } else {
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
    const previousColumnCount = this._matrixColumnCount();
    const previousRowCount = this.matrix.length;

    this._ensureEmptyColumns();
    this._ensureEmptyRows();

    return (
      previousColumnCount !== this._matrixColumnCount() ||
      previousRowCount !== this.matrix.length
    );
  }

  resetToOriginal() {
    this._buildMatrix();
  }

  _matrixColumnCount() {
    if (!this.matrix || this.matrix.length === 0) {
      return 1;
    }

    return Math.max(1, this.matrix[0].length);
  }
}

module.exports = ExpensesReportModel;
