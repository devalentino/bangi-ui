const m = require("mithril");
const auth = require("./auth");

const CoreFlow = {
  flowId: null,
  campaignId: null,
  isLoading: false,
  error: null,
  successMessage: null,
  lastLoaded: null,
  form: {
    name: null,
    rule: null,
    actionType: "redirect",
    redirectUrl: null,
    landingArchive: null,
    landingPath: null,
    orderValue: null,
    isEnabled: true,
  },

  setFormValues: function (payload) {
    CoreFlow.form.name = payload.name || "";
    CoreFlow.form.rule = payload.rule || "";
    CoreFlow.form.actionType = payload.actionType || "redirect";
    CoreFlow.form.redirectUrl = payload.redirectUrl || "";
    CoreFlow.form.landingArchive = null;
    CoreFlow.form.landingPath = payload.landingPath || "";
    CoreFlow.form.orderValue =
      payload.orderValue !== null && payload.orderValue !== undefined
        ? String(payload.orderValue)
        : "0";
    CoreFlow.form.isEnabled = Boolean(payload.isEnabled);
  },

  resetForm: function () {
    if (CoreFlow.lastLoaded) {
      CoreFlow.setFormValues(CoreFlow.lastLoaded);
    } else {
      CoreFlow.setFormValues({});
      CoreFlow.form.orderValue = "0";
      CoreFlow.form.isEnabled = true;
    }
  },

  fetch: function (flowId, campaignId) {
    if (!flowId) {
      CoreFlow.error = "Bad flow id.";
      return;
    }

    CoreFlow.flowId = null;
    CoreFlow.campaignId = campaignId;
    CoreFlow.error = null;
    CoreFlow.successMessage = null;
    CoreFlow.lastLoaded = null;
    CoreFlow.isLoading = true;

    if (flowId === "new") {
      if (campaignId === undefined || campaignId === null || campaignId === "") {
        CoreFlow.error = "Campaign ID is required.";
        CoreFlow.isLoading = false;
        return;
      }
      CoreFlow.flowId = flowId;
      CoreFlow.isLoading = false;
      CoreFlow.resetForm();
      return;
    }

    if (campaignId === undefined || campaignId === null || campaignId === "") {
      CoreFlow.error = "Campaign ID is required.";
      CoreFlow.isLoading = false;
      return;
    }

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}/flows/${flowId}`,
      headers: { Authorization: `Basic ${auth.Authentication.token}` },
    })
      .then(function (payload) {
        CoreFlow.flowId = flowId;
        CoreFlow.lastLoaded = payload;
        CoreFlow.setFormValues(payload);
        CoreFlow.isLoading = false;
      })
      .catch(function () {
        CoreFlow.error = "Failed to load flow details.";
        CoreFlow.isLoading = false;
      });
  },

  validate: function () {
    if (!CoreFlow.form.name.trim()) {
      return "Name is required.";
    }

    if (!CoreFlow.form.rule.trim()) {
      return "Rule is required.";
    }

    if (!CoreFlow.form.actionType) {
      return "Action type is required.";
    }

    if (CoreFlow.form.actionType === "redirect") {
      try {
        new URL(CoreFlow.form.redirectUrl.trim());
      } catch (error) {
        return "Redirect URL must be a valid URL.";
      }
    }

    if (CoreFlow.form.actionType === "render" && !CoreFlow.form.landingArchive) {
      return "Landing archive is required.";
    }

    return null;
  },

  buildPayload: function () {
    let payload = {
      name: CoreFlow.form.name.trim(),
      rule: CoreFlow.form.rule.trim(),
      actionType: CoreFlow.form.actionType,
      redirectUrl:
        CoreFlow.form.actionType === "redirect"
          ? CoreFlow.form.redirectUrl.trim() || null
          : null,
      isEnabled: CoreFlow.form.isEnabled,
    };

    return payload;
  },

  buildFormData: function (payload) {
    let formData = new FormData();

    Object.keys(payload).forEach(function (key) {
      if (payload[key] !== undefined && payload[key] !== null) {
        formData.append(key, payload[key]);
      }
    });

    if (CoreFlow.form.landingArchive) {
      formData.append("landingArchive", CoreFlow.form.landingArchive);
    }

    return formData;
  },

  save: function () {
    CoreFlow.error = null;
    CoreFlow.successMessage = null;

    let validationError = CoreFlow.validate();
    if (validationError) {
      CoreFlow.error = validationError;
      return;
    }

    let payload = CoreFlow.buildPayload();
    let isNew = CoreFlow.flowId === "new";
    let method = isNew ? "POST" : "PATCH";
    let url = isNew
      ? `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${CoreFlow.campaignId}/flows`
      : `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${CoreFlow.campaignId}/flows/${CoreFlow.flowId}`;

    m.request(
      {
        method: method,
        url: url,
        headers: { Authorization: `Basic ${auth.Authentication.token}` },
        body: CoreFlow.buildFormData(payload),
        serialize: function (value) {
          return value;
        },
      },
    )
      .then(function () {
        CoreFlow.successMessage = isNew
          ? "Flow created successfully."
          : "Flow updated successfully.";
        setTimeout(function () {
            m.route.set(`/core/campaigns/${CoreFlow.campaignId}`);
        }, 2000);
      })
      .catch(function () {
        CoreFlow.error = isNew
          ? "Failed to create flow."
          : "Failed to update flow.";
      });
  },
};

module.exports = CoreFlow;
