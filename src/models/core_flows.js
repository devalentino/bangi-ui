const m = require("mithril");

class CoreFlowsModel {
  constructor(auth) {
    this.auth = auth;
    this.items = [];
    this.pagination = null;
    this.isLoading = false;
    this.error = null;
    this.campaignId = null;
  }

  updateOrderBulk(campaignId, orderMapping) {
    if (campaignId === undefined || campaignId === null || campaignId === "") {
      this.error = "Campaign ID is required.";
      return Promise.reject(new Error("Campaign ID is required."));
    }

    return m.request({
      method: "PATCH",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}/flows/order`,
      headers: { Authorization: `Basic ${this.auth.token}` },
      body: { order: orderMapping },
    });
  }

  fetch(options) {
    this.isLoading = true;
    this.error = null;
    let params = options || {};

    if (params.campaignId === undefined || params.campaignId === null || params.campaignId === "") {
      this.isLoading = false;
      this.error = "Campaign ID is required.";
      return;
    }

    this.campaignId = params.campaignId;

    let requestParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 1000,
      sortBy: params.sortBy || "orderValue",
      sortOrder: params.sortOrder || "asc",
    };

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${params.campaignId}/flows`,
      headers: { Authorization: `Basic ${this.auth.token}` },
      params: requestParams,
    })
      .then(function (payload) {
        this.items = payload.content || [];
        this.pagination = payload.pagination;
        this.isLoading = false;
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load flows.";
        this.isLoading = false;
      }.bind(this));
  }
}

module.exports = CoreFlowsModel;
