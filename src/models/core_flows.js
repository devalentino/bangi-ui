const m = require("mithril");
const auth = require("./auth");

const CoreFlows = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
  campaignId: null,

  updateOrderBulk: function (campaignId, orderMapping) {
    return m.request({
      method: "PATCH",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}/flows/order`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      body: {order: orderMapping},
    });
  },

  fetch: function (campaignId, params) {
    CoreFlows.isLoading = true;
    CoreFlows.error = null;

    let requestParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 1000,
      sortBy: params.sortBy || "orderValue",
      sortOrder: params.sortOrder || "desc",
    };

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}/flows`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      params: requestParams,
    })
      .then(function (payload) {
        CoreFlows.items = payload.content;
        CoreFlows.pagination = payload.pagination;
        CoreFlows.isLoading = false;
      })
      .catch(function () {
        CoreFlows.error = "Failed to load flows.";
        CoreFlows.isLoading = false;
      });
  },
};

module.exports = CoreFlows;
