const m = require("mithril");

class CoreFlowModel {
  constructor(auth) {
    this.auth = auth;
    this.flowId = null;
    this.campaignId = null;
    this.isLoading = false;
    this.error = null;
    this.successMessage = null;
    this.lastLoaded = null;
    this.form = {
      name: null,
      rule: null,
      actionType: "redirect",
      redirectUrl: null,
      landingArchive: null,
      landingPath: null,
      orderValue: null,
      isEnabled: true,
    };
  }

  setFormValues(payload) {
    this.form.name = payload.name || "";
    this.form.rule = payload.rule || "";
    this.form.actionType = payload.actionType || "redirect";
    this.form.redirectUrl = payload.redirectUrl || "";
    this.form.landingArchive = null;
    this.form.landingPath = payload.landingPath || "";
    this.form.orderValue =
      payload.orderValue !== null && payload.orderValue !== undefined
        ? String(payload.orderValue)
        : "0";
    this.form.isEnabled = Boolean(payload.isEnabled);
  }

  resetForm() {
    if (this.lastLoaded) {
      this.setFormValues(this.lastLoaded);
    } else {
      this.setFormValues({});
      this.form.orderValue = "0";
      this.form.isEnabled = true;
    }
  }

  fetch(flowId, campaignId) {
    if (!flowId) {
      this.error = "Bad flow id.";
      return;
    }

    this.flowId = null;
    this.campaignId = campaignId;
    this.error = null;
    this.successMessage = null;
    this.lastLoaded = null;
    this.isLoading = true;

    if (flowId === "new") {
      if (campaignId === undefined || campaignId === null || campaignId === "") {
        this.error = "Campaign ID is required.";
        this.isLoading = false;
        return;
      }
      this.flowId = flowId;
      this.isLoading = false;
      this.resetForm();
      return;
    }

    if (campaignId === undefined || campaignId === null || campaignId === "") {
      this.error = "Campaign ID is required.";
      this.isLoading = false;
      return;
    }

    m.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${campaignId}/flows/${flowId}`,
      headers: { Authorization: `Basic ${this.auth.token}` },
    })
      .then(function (payload) {
        this.flowId = flowId;
        this.lastLoaded = payload;
        this.setFormValues(payload);
        this.isLoading = false;
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load flow details.";
        this.isLoading = false;
      }.bind(this));
  }

  validate() {
    if (!this.form.name.trim()) {
      return "Name is required.";
    }

    if (!this.form.rule.trim()) {
      return "Rule is required.";
    }

    if (!this.form.actionType) {
      return "Action type is required.";
    }

    if (this.form.actionType === "redirect") {
      let redirectUrl = (this.form.redirectUrl || "").trim();
      if (redirectUrl) {
        try {
          new URL(redirectUrl);
        } catch (error) {
          return "Redirect URL must be a valid URL.";
        }
      }
    }

    if (this.form.actionType === "render" && !this.form.landingArchive) {
      return "Landing archive is required.";
    }

    return null;
  }

  buildPayload() {
    return {
      name: this.form.name.trim(),
      rule: this.form.rule.trim(),
      actionType: this.form.actionType,
      redirectUrl:
        this.form.actionType === "redirect"
          ? this.form.redirectUrl.trim() || null
          : null,
      isEnabled: this.form.isEnabled,
    };
  }

  buildFormData(payload) {
    let formData = new FormData();

    Object.keys(payload).forEach(function (key) {
      if (payload[key] !== undefined && payload[key] !== null) {
        formData.append(key, payload[key]);
      }
    });

    if (this.form.landingArchive) {
      formData.append("landingArchive", this.form.landingArchive);
    }

    return formData;
  }

  save() {
    this.error = null;
    this.successMessage = null;

    let validationError = this.validate();
    if (validationError) {
      this.error = validationError;
      return;
    }

    if (this.campaignId === null || this.campaignId === "") {
      this.error = "Campaign ID is required.";
      return;
    }

    let payload = this.buildPayload();
    let isNew = this.flowId === "new";
    let method = isNew ? "POST" : "PATCH";
    let url = isNew
      ? `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${this.campaignId}/flows`
      : `${process.env.BACKEND_API_BASE_URL}/core/campaigns/${this.campaignId}/flows/${this.flowId}`;

    m.request(
      {
        method: method,
        url: url,
        headers: { Authorization: `Basic ${this.auth.token}` },
        body: this.buildFormData(payload),
        serialize: function (value) {
          return value;
        },
      },
    )
      .then(function () {
        this.successMessage = isNew
          ? "Flow created successfully."
          : "Flow updated successfully.";
        setTimeout(function () {
          if (this.campaignId) {
            m.route.set(`/core/campaigns/${this.campaignId}`);
          } else {
            m.route.set("/core/campaigns");
          }
        }.bind(this), 2000);
      }.bind(this))
      .catch(function () {
        this.error = isNew
          ? "Failed to create flow."
          : "Failed to update flow.";
      }.bind(this));
  }
}

module.exports = CoreFlowModel;
