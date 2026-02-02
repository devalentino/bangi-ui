let m = require("mithril");
let FacebookPacsAdCabinetModel = require("../models/facebook_pacs_ad_cabinet");

class FacebookPacsAdCabinetView {
  constructor() {
    this.model = new FacebookPacsAdCabinetModel(m.route.param("adCabinetId"));
  }

  oninit() {
    let adCabinetId = m.route.param("adCabinetId");
    if (adCabinetId !== "new") {
      this.model.fetch();
    }
  }

  view() {
    let isNew = this.model.adCabinetId === "new";

    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12.col-xl-6", [
          m(".bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", isNew ? "New Ad Cabinet" : "Ad Cabinet Modification"),
            this.model.isLoading
              ? m("div", "Loading ad cabinet...")
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
                        m("label.form-label", { for: "adCabinetName" }, "Name"),
                        m("input.form-control", {
                          type: "text",
                          id: "adCabinetName",
                          placeholder: "Ad cabinet name",
                          value: this.model.form.name,
                          oninput: function (event) {
                            this.model.form.name = event.target.value;
                          }.bind(this),
                        }),
                      ]),
                      m(".form-check.mb-3", [
                        m("input.form-check-input", {
                          type: "checkbox",
                          id: "adCabinetIsBanned",
                          checked: this.model.form.isBanned,
                          onchange: function (event) {
                            this.model.form.isBanned = event.target.checked;
                          }.bind(this),
                        }),
                        m(
                          "label.form-check-label",
                          { for: "adCabinetIsBanned" },
                          "Banned",
                        ),
                      ]),
                      !isNew
                        ? m(".mb-3", [
                            m("label.form-label", "Business Portfolio"),
                            m(
                              "div.form-control-plaintext",
                              this.model.businessPortfolio
                                ? this.model.businessPortfolio.name
                                : "—",
                            ),
                          ])
                        : null,
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
      ]),
    );
  }
}

module.exports = FacebookPacsAdCabinetView;
