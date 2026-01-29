const m = require("mithril");
const auth = require("./auth");

const CoreCampaign = {
  campaignId: null,
  isLoading: false,
  error: null,
  successMessage: null,
  lastLoaded: null,
  form: {
    name: "",
    costModel: "cpc",
    costValue: "",
    currency: "usd",
    statusMapperText: "",
  },

  setFormValues: function (payload) {
    CoreCampaign.form.name = payload.name || "";
    CoreCampaign.form.costModel = payload.costModel || "cpc";
    CoreCampaign.form.costValue =
      payload.costValue !== null && payload.costValue !== undefined
        ? String(payload.costValue)
        : "";
    CoreCampaign.form.currency = payload.currency || "usd";
    CoreCampaign.form.statusMapperText = payload.statusMapper
      ? JSON.stringify(payload.statusMapper, null, 2)
      : "";
  },

  resetForm: function () {
    if (CoreCampaign.lastLoaded) {
      CoreCampaign.setFormValues(CoreCampaign.lastLoaded);
      return;
    }

    CoreCampaign.form.name = "";
    CoreCampaign.form.costModel = "cpc";
    CoreCampaign.form.costValue = "";
    CoreCampaign.form.currency = "usd";
    CoreCampaign.form.statusMapperText = "";
  },

  load: function (campaignId) {
    if (!campaignId) {
      CoreCampaign.error = "Campaign id is missing.";
      return;
    }

    if (campaignId === "new") {
      CoreCampaign.campaignId = campaignId;
      CoreCampaign.error = null;
      CoreCampaign.successMessage = null;
      CoreCampaign.isLoading = false;
      CoreCampaign.lastLoaded = null;
      CoreCampaign.resetForm();
      return;
    }

    CoreCampaign.isLoading = true;
    CoreCampaign.error = null;
    CoreCampaign.successMessage = null;
    CoreCampaign.campaignId = campaignId;

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
    })
      .then(function (payload) {
        CoreCampaign.lastLoaded = payload;
        CoreCampaign.setFormValues(payload);
        CoreCampaign.isLoading = false;
      })
      .catch(function () {
        CoreCampaign.error = "Failed to load campaign details.";
        CoreCampaign.isLoading = false;
      });
  },

  validate: function () {
    if (!CoreCampaign.form.name.trim()) {
      return "Name is required.";
    }

    if (!CoreCampaign.form.costModel) {
      return "Cost model is required.";
    }

    if (!CoreCampaign.form.currency) {
      return "Currency is required.";
    }

    if (CoreCampaign.form.costValue === "") {
      return "Cost value is required.";
    }

    if (Number.isNaN(Number(CoreCampaign.form.costValue))) {
      return "Cost value must be a number.";
    }

    if (CoreCampaign.form.statusMapperText.trim().length > 0) {
      try {
        JSON.parse(CoreCampaign.form.statusMapperText);
      } catch (error) {
        return "Status mapper must be valid JSON.";
      }
    }

    return null;
  },

  buildPayload: function () {
    let statusMapper = null;
    let statusMapperText = CoreCampaign.form.statusMapperText.trim();

    if (statusMapperText.length > 0) {
      statusMapper = JSON.parse(statusMapperText);
    }

    return {
      name: CoreCampaign.form.name.trim(),
      costModel: CoreCampaign.form.costModel,
      costValue: Number(CoreCampaign.form.costValue),
      currency: CoreCampaign.form.currency,
      statusMapper: statusMapper,
    };
  },

  update: function () {
    CoreCampaign.error = null;
    CoreCampaign.successMessage = null;

    let validationError = CoreCampaign.validate();
    if (validationError) {
      CoreCampaign.error = validationError;
      return;
    }

    let payload;
    try {
      payload = CoreCampaign.buildPayload();
    } catch (error) {
      CoreCampaign.error = "Status mapper must be valid JSON.";
      return;
    }

    let isNew = CoreCampaign.campaignId === "new";
    let method = isNew ? "POST" : "PATCH";
    let url = isNew
      ? `${process.env.BACKEND_API_BASE_URL}/core/campaigns`
      : `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${CoreCampaign.campaignId}`;

    m.request({
      method: method,
      url: url,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
      body: payload,
    })
      .then(function () {
        CoreCampaign.successMessage = isNew
          ? "Campaign created successfully."
          : "Campaign updated successfully.";
        setTimeout(function () {
          m.route.set("/core/campaigns");
        }, 2000);
      })
      .catch(function () {
        CoreCampaign.error = isNew
          ? "Failed to create campaign."
          : "Failed to update campaign.";
      });
  },
};

module.exports = CoreCampaign;
