let m = require("mithril");
let FacebookPacsBusinessPortfolioModel = require("../models/facebook_pacs_business_portfolio");

class FacebookPacsBusinessPortfolioView {
  constructor() {
    this.model = new FacebookPacsBusinessPortfolioModel(
      m.route.param("businessPortfolioId"),
    );
  }

  oninit() {
    let businessPortfolioId = m.route.param("businessPortfolioId");
    if (businessPortfolioId !== "new") {
      this.model.fetch();
    }
  }

  view() {
    let isNew = this.model.businessPortfolioId === "new";

    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12.col-xl-6", [
          m(".bg-light.rounded.h-100.p-4", [
            m(
              "h6.mb-4",
              isNew ? "New Business Portfolio" : "Business Portfolio Modification",
            ),
            this.model.isLoading
              ? m("div", "Loading business portfolio...")
              : [
                  this.model.error
                    ? m(".alert.alert-danger", this.model.error)
                    : null,
                  this.model.successMessage
                    ? m(".alert.alert-success", this.model.successMessage)
                    : null,
                  m(
                    "form",
                    {
                      onsubmit: function (event) {
                        event.preventDefault();
                        this.model.save();
                      }.bind(this),
                      onreset: function (event) {
                        event.preventDefault();
                        this.model.resetForm();
                      }.bind(this),
                    },
                    [
                      m(".mb-3", [
                        m("label.form-label", { for: "portfolioName" }, "Name"),
                        m("input.form-control", {
                          type: "text",
                          id: "portfolioName",
                          placeholder: "Business portfolio name",
                          value: this.model.form.name,
                          oninput: function (event) {
                            this.model.form.name = event.target.value;
                          }.bind(this),
                        }),
                      ]),
                      m(".form-check.mb-3", [
                        m("input.form-check-input", {
                          type: "checkbox",
                          id: "portfolioIsBanned",
                          checked: this.model.form.isBanned,
                          onchange: function (event) {
                            this.model.form.isBanned = event.target.checked;
                          }.bind(this),
                        }),
                        m(
                          "label.form-check-label",
                          { for: "portfolioIsBanned" },
                          "Banned",
                        ),
                      ]),
                      m(
                        "button.btn.btn-primary",
                        { type: "submit" },
                        "Save changes",
                      ),
                      m(
                        "button.btn.btn-secondary.ms-2",
                        { type: "reset" },
                        "Reset",
                      ),
                    ],
                  ),
                ],
          ]),
        ]),
        isNew
          ? null
          : m(".col-12.col-xl-6", [
              m(".bg-light.rounded.h-100.p-4", [
                m("h6.mb-4", "Linked Resources"),
                m("div.mb-3", [
                  m("div.fw-bold", "Executors"),
                  this.model.executors.length === 0
                    ? m("div.text-muted", "No executors linked.")
                    : m(
                        "ul.mb-0",
                        this.model.executors.map(function (executor) {
                          return m("li", executor.name);
                        }),
                      ),
                ]),
                m("div", [
                  m("div.fw-bold", "Ad Cabinets"),
                  this.model.adCabinets.length === 0
                    ? m("div.text-muted", "No ad cabinets linked.")
                    : m(
                        "ul.mb-0",
                        this.model.adCabinets.map(function (adCabinet) {
                          return m("li", adCabinet.name);
                        }),
                      ),
                ]),
              ]),
            ]),
      ]),
    );
  }
}

module.exports = FacebookPacsBusinessPortfolioView;
