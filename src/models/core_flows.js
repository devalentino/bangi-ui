const m = require("mithril");
const auth = require("./auth");

const CoreFlows = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetch: function () {
    CoreFlows.isLoading = true;
    CoreFlows.error = null;

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/flows`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      params: {
        page: m.route.param("page") || 1,
        pageSize: m.route.param("pageSize") || 10,
        sortBy: m.route.param("sortBy") || "id",
        sortOrder: m.route.param("sortOrder") || "asc"
      },
    })
      .then(function (payload) {
        CoreFlows.items = payload.content || [];
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
