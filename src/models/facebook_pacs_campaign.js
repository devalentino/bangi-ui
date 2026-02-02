const m = require("mithril");
const api = require("./api");

class FacebookPacsCampaignModel {
  constructor(campaignId) {
    this.campaignId = campaignId;
    this.isLoading = false;
    this.error = null;
    this.successMessage = null;
    this.lastLoaded = null;
    this.form = {
      name: "",
      executorId: "",
      adCabinetId: "",
      businessPageId: "",
    };
  }

  setFormValues(payload) {
    this.form.name = payload.name || "";
    this.form.executorId = payload.executor ? String(payload.executor.id) : "";
    this.form.adCabinetId = payload.adCabinet ? String(payload.adCabinet.id) : "";
    this.form.businessPageId = payload.businessPage ? String(payload.businessPage.id) : "";
  }

  resetForm() {
    if (this.lastLoaded) {
      this.setFormValues(this.lastLoaded);
    } else {
      this.setFormValues({});
    }
  }

  fetch() {
    this.error = null;
    this.successMessage = null;
    this.lastLoaded = null;
    this.isLoading = true;

    api.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/campaigns/${this.campaignId}`,
    })
      .then(function (payload) {
        this.lastLoaded = payload;
        this.setFormValues(payload);
        this.isLoading = false;
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load campaign details.";
        this.isLoading = false;
      }.bind(this));
  }

  validate() {
    if (!this.form.name.trim()) {
      return "Name is required.";
    }

    if (!this.form.executorId) {
      return "Executor is required.";
    }

    if (!this.form.adCabinetId) {
      return "Ad cabinet is required.";
    }

    if (!this.form.businessPageId) {
      return "Business page is required.";
    }

    return null;
  }

  buildPayload() {
    return {
      name: this.form.name.trim(),
      executorId: Number(this.form.executorId),
      adCabinetId: Number(this.form.adCabinetId),
      businessPageId: Number(this.form.businessPageId),
    };
  }

  save() {
    this.error = null;
    this.successMessage = null;

    let validationError = this.validate();
    if (validationError) {
      this.error = validationError;
      return;
    }

    let payload = this.buildPayload();
    let isNew = this.campaignId === "new";
    let method = isNew ? "POST" : "PATCH";
    let url = isNew
      ? `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/campaigns`
      : `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/campaigns/${this.campaignId}`;

    api.request({
      method: method,
      url: url,
      body: payload,
    })
      .then(function () {
        this.successMessage = isNew
          ? "Campaign created successfully."
          : "Campaign updated successfully.";
        setTimeout(function () {
          m.route.set("/facebook/pacs/campaigns");
        }, 2000);
      }.bind(this))
      .catch(function () {
        this.error = isNew
          ? "Failed to create campaign."
          : "Failed to update campaign.";
      }.bind(this));
  }
}

module.exports = FacebookPacsCampaignModel;
