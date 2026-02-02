const m = require("mithril");
const api = require("./api");

class FacebookPacsBusinessPortfolioAccessUrlModel {
  constructor(businessPortfolioId) {
    this.businessPortfolioId = businessPortfolioId;
    this.isLoading = false;
    this.error = null;
    this.successMessage = null;
    this.form = {
      url: "",
      expiresAt: "",
    };
  }

  resetForm() {
    this.form.url = "";
    this.form.expiresAt = "";
  }

  validate() {
    if (!this.form.url.trim()) {
      return "URL is required.";
    }

    if (!this.form.expiresAt.trim()) {
      return "Expiration date is required.";
    }

    return null;
  }

  buildPayload() {
    return {
      url: this.form.url.trim(),
      expiresAt: this.form.expiresAt.trim(),
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

    api.request({
      method: "POST",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios/${this.businessPortfolioId}/access-urls`,
      body: payload,
    })
      .then(function () {
        this.successMessage = "Access URL created successfully.";
        setTimeout(function () {
          m.route.set(`/facebook/pacs/business-portfolios/${this.businessPortfolioId}/access-urls`);
        }.bind(this), 2000);
      }.bind(this))
      .catch(function () {
        this.error = "Failed to create access URL.";
      }.bind(this));
  }
}

module.exports = FacebookPacsBusinessPortfolioAccessUrlModel;
