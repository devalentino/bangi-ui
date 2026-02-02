const m = require("mithril");
const api = require("./api");

class FacebookPacsExecutorsModel {
  constructor() {
    this.items = [];
    this.pagination = null;
    this.isLoading = false;
    this.error = null;
  }

  fetch() {
    this.isLoading = true;
    this.error = null;

    api.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/executors`,
      params: {
        page: m.route.param("page") || 1,
        pageSize: m.route.param("pageSize") || 10,
        sortBy: m.route.param("sortBy") || "id",
        sortOrder: m.route.param("sortOrder") || "asc",
      },
    })
      .then(function (payload) {
        this.items = payload.content;
        this.pagination = payload.pagination;
        this.isLoading = false;
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load executors.";
        this.isLoading = false;
      }.bind(this));
  }
}

module.exports = FacebookPacsExecutorsModel;
