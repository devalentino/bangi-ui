const m = require("mithril");
const api = require("./api");

class FacebookPacsBusinessPortfolioModel {
  constructor(businessPortfolioId) {
    this.businessPortfolioId = businessPortfolioId;
    this.isLoading = false;
    this.error = null;
    this.successMessage = null;
    this.lastLoaded = null;
    this.form = {
      name: "",
      isBanned: false,
    };
    this.executors = [];
    this.adCabinets = [];
  }

  setFormValues(payload) {
    this.form.name = payload.name || "";
    this.form.isBanned = payload.isBanned || false;
    this.executors = payload.executors || [];
    this.adCabinets = payload.adCabinets || [];
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
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios/${this.businessPortfolioId}`,
    })
      .then(function (payload) {
        this.lastLoaded = payload;
        this.setFormValues(payload);
        this.isLoading = false;
      }.bind(this))
      .catch(function () {
        this.error = "Failed to load business portfolio details.";
        this.isLoading = false;
      }.bind(this));
  }

  validate() {
    if (!this.form.name.trim()) {
      return "Name is required.";
    }

    return null;
  }

  buildPayload() {
    return {
      name: this.form.name.trim(),
      isBanned: this.form.isBanned,
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
    let isNew = this.businessPortfolioId === "new";
    let method = isNew ? "POST" : "PATCH";
    let url = isNew
      ? `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios`
      : `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios/${this.businessPortfolioId}`;

    api.request({
      method: method,
      url: url,
      body: payload,
    })
      .then(function () {
        this.successMessage = isNew
          ? "Business portfolio created successfully."
          : "Business portfolio updated successfully.";
        setTimeout(function () {
          m.route.set("/facebook/pacs/business-portfolios");
        }, 2000);
      }.bind(this))
      .catch(function () {
        this.error = isNew
          ? "Failed to create business portfolio."
          : "Failed to update business portfolio.";
      }.bind(this));
  }

  addExecutor(executorId) {
    return api.request({
      method: "POST",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios/${this.businessPortfolioId}/executors/${executorId}`,
    });
  }

  removeExecutor(executorId) {
    return api.request({
      method: "DELETE",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/business-portfolios/${this.businessPortfolioId}/executors/${executorId}`,
    });
  }

  searchExecutors(query) {
    let trimmed = query.trim();

    if (!trimmed) {
      return Promise.resolve([]);
    }

    return api.request({
      method: "GET",
      url: `${process.env.BACKEND_API_BASE_URL}/facebook/pacs/executors`,
      params: {
        page: 1,
        pageSize: 20,
        sortBy: "id",
        sortOrder: "asc",
        partialName: trimmed,
      },
    })
      .then(function (payload) {
        return payload.content;
      });
  }

}

module.exports = FacebookPacsBusinessPortfolioModel;
