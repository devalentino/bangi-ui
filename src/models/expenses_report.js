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
    this.columns = [];
    this.columnFields = [];
    this.rows = [];
    this.originalRows = [];
    this.originalColumns = [];
    this.originalColumnFields = [];
    this.distributionKeys = [];
    this.distributionParameter = "";
    this.isLoading = false;
    this.error = null;
    this.isDirty = false;
    this.tableVersion = 0;
  }

  fetch() {
    if (!this.filter.isReady()) {
      return;
    }

    const startMs = Date.parse(this.filter.start);
    const endMs = Date.parse(this.filter.end);

    const diffDays = Math.floor((endMs - startMs) / 86400000) + 1;
    let pageSize = Math.max(1, diffDays);

    this.isLoading = true;
    this.error = null;

    api
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
        const content = Array.isArray(payload.content)
          ? payload.content
          : (payload.content && payload.content.content) || [];

        this.records = content || [];
        this._buildTableData();
        this.isLoading = false;
        this.isDirty = false;
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

    this.distributionKeys = Array.from(distributionKeySet).sort(function (a, b) {
      return a.localeCompare(b);
    });

    this._buildColumns(this.distributionKeys.length + 2);
    this._buildRowsFromRecords();
    this._ensureEmptyRows();
    this._ensureEmptyColumns();

    this.originalRows = JSON.parse(JSON.stringify(this.rows));
    this.originalColumns = JSON.parse(JSON.stringify(this.columns));
    this.originalColumnFields = JSON.parse(JSON.stringify(this.columnFields));
    this.tableVersion += 1;
  }

  _buildColumns(columnCount) {
    const fields = [];

    for (let i = 0; i < columnCount; i += 1) {
      fields.push(`c${i + 1}`);
    }

    this.columnFields = fields;
    this.columns = [
      {
        title: this._excelColumnTitle(0),
        field: "date",
        hozAlign: "left",
        editor: "input",
        frozen: true,
      },
    ].concat(
      fields.map(
        function (field, index) {
          return {
            title: this._excelColumnTitle(index + 1),
            field: field,
            editor: "input",
            hozAlign: "right",
          };
        }.bind(this),
      ),
    );
  }

  _buildRowsFromRecords() {
    const headerRow = { date: "" };

    this.distributionKeys.forEach(
      function (key, index) {
        headerRow[this.columnFields[index]] = key;
      }.bind(this),
    );

    this.rows = [headerRow].concat(
      this.records.map(
        function (record) {
          const row = { date: record.date };
          const distribution = record.distribution || {};

          this.distributionKeys.forEach(
            function (key, index) {
              if (Object.prototype.hasOwnProperty.call(distribution, key)) {
                row[this.columnFields[index]] = distribution[key];
              }
            }.bind(this),
          );

          return row;
        }.bind(this),
      ),
    );
  }

  _excelColumnTitle(index) {
    let title = "";
    let num = index + 1;

    while (num > 0) {
      let remainder = (num - 1) % 26;
      title = String.fromCharCode(65 + remainder) + title;
      num = Math.floor((num - 1) / 26);
    }

    return title;
  }

  _isRowEmpty(row) {
    if (!row) {
      return true;
    }

    if (row.date !== null && row.date !== undefined && row.date !== "") {
      return false;
    }

    return this.columnFields.every(function (field) {
      const value = row[field];
      return value === null || value === undefined || value === "";
    });
  }

  _ensureEmptyRows() {
    let emptyTrailingRows = 0;

    for (let i = this.rows.length - 1; i >= 1; i -= 1) {
      if (this._isRowEmpty(this.rows[i])) {
        emptyTrailingRows += 1;
      } else {
        break;
      }
    }

    while (emptyTrailingRows < 2) {
      const row = { date: "" };
      this.columnFields.forEach(function (field) {
        row[field] = "";
      });
      this.rows.push(row);
      emptyTrailingRows += 1;
    }
  }

  _ensureEmptyColumns() {
    if (this.rows.length === 0) {
      this.rows = [{ date: "" }];
    }

    const headerRow = this.rows[0];
    let trailingEmptyColumns = 0;

    for (let i = this.columnFields.length - 1; i >= 0; i -= 1) {
      const field = this.columnFields[i];
      const value = headerRow[field];
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
    const startIndex = this.columnFields.length;

    for (let i = 0; i < needed; i += 1) {
      const field = `c${startIndex + i + 1}`;
      this.columnFields.push(field);
    }

    this.columns = [
      {
        title: this._excelColumnTitle(0),
        field: "date",
        hozAlign: "left",
        editor: "input",
        frozen: true,
      },
    ].concat(
      this.columnFields.map(
        function (field, index) {
          return {
            title: this._excelColumnTitle(index + 1),
            field: field,
            editor: "input",
            hozAlign: "right",
          };
        }.bind(this),
      ),
    );

    this.rows.forEach(
      function (row) {
        for (let i = 0; i < needed; i += 1) {
          const field = `c${startIndex + i + 1}`;
          if (!Object.prototype.hasOwnProperty.call(row, field)) {
            row[field] = "";
          }
        }
      }.bind(this),
    );
  }

  ensureMinimumEmptySpace() {
    const previousColumnCount = this.columnFields.length;
    const previousRowCount = this.rows.length;

    this._ensureEmptyColumns();
    this._ensureEmptyRows();

    return (
      previousColumnCount !== this.columnFields.length ||
      previousRowCount !== this.rows.length
    );
  }

  resetToOriginal() {
    this.rows = JSON.parse(JSON.stringify(this.originalRows));
    this.columns = JSON.parse(JSON.stringify(this.originalColumns));
    this.columnFields = JSON.parse(JSON.stringify(this.originalColumnFields));
    this.isDirty = false;
    this.tableVersion += 1;
  }
}

module.exports = ExpensesReportModel;
