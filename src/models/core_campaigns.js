const m = require("mithril");
const auth = require("./auth");

const CoreCampaigns = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,

  fetch: function () {
    CoreCampaigns.isLoading = true;
    CoreCampaigns.error = null;

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      params: {
        page: m.route.param("page") || 1,
        pageSize: m.route.param("pageSize") || 10,
        sortBy: m.route.param("sortBy") || "id",
        sortOrder: m.route.param("sortOrder") || "asc"
      },
    })
      .then(function (payload) {
        CoreCampaigns.items = payload.content;
        CoreCampaigns.pagination = payload.pagination;
        CoreCampaigns.isLoading = false;
      })
      .catch(function () {
        CoreCampaigns.error = "Failed to load campaigns.";
        CoreCampaigns.isLoading = false;
      });
  },
};

module.exports = CoreCampaigns;
