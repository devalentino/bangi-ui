let m = require("mithril");
let coreCampaignModel = require("../models/core_campaign");

let CoreCampaign = {
  oninit: function () {
    coreCampaignModel.load(m.route.param("campaignId"));
  },
  onbeforeupdate: function () {
    let campaignId = m.route.param("campaignId");
    if (campaignId && campaignId !== coreCampaignModel.campaignId) {
      coreCampaignModel.load(campaignId);
    }
  },
  view: function () {
    let isNew = coreCampaignModel.campaignId === "new";

    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12.col-xl-6", [
          m(".bg-light.rounded.h-100.p-4", [
            m(
              "h6.mb-4",
              isNew ? "New Core Campaign" : "Core Campaign Modification",
            ),
            coreCampaignModel.isLoading
              ? m("div", "Loading campaign...")
              : [
                  coreCampaignModel.error
                    ? m(".alert.alert-danger", coreCampaignModel.error)
                    : null,
                  coreCampaignModel.successMessage
                    ? m(
                        ".alert.alert-success",
                        coreCampaignModel.successMessage,
                      )
                    : null,
                  m(
                    "form",
                    {
                      onsubmit: function (event) {
                        event.preventDefault();
                        coreCampaignModel.update();
                      },
                      onreset: function (event) {
                        event.preventDefault();
                        coreCampaignModel.resetForm();
                      },
                    },
                    [
                      m(".mb-3", [
                        m("label.form-label", { for: "campaignName" }, "Name"),
                        m("input.form-control", {
                          type: "text",
                          id: "campaignName",
                          placeholder: "Spring Promo - US",
                          value: coreCampaignModel.form.name,
                          oninput: function (event) {
                            coreCampaignModel.form.name = event.target.value;
                          },
                        }),
                      ]),
                      m(".row.g-3", [
                        m(".col-sm-12.col-md-6", [
                          m(
                            "label.form-label",
                            { for: "costValue" },
                            "Cost value",
                          ),
                          m("input.form-control", {
                            type: "number",
                            min: "0",
                            step: "0.01",
                            id: "costValue",
                            placeholder: "1.25",
                            value: coreCampaignModel.form.costValue,
                            oninput: function (event) {
                              coreCampaignModel.form.costValue =
                                event.target.value;
                            },
                          }),
                        ]),
                        m(".col-sm-12.col-md-6", [
                          m(
                            "label.form-label",
                            { for: "currency" },
                            "Currency",
                          ),
                          m(
                            "select.form-select",
                            {
                              id: "currency",
                              value: coreCampaignModel.form.currency,
                              oninput: function (event) {
                                coreCampaignModel.form.currency =
                                  event.target.value;
                              },
                            },
                            [
                              m("option", { value: "usd" }, "USD"),
                              m("option", { value: "eur" }, "EUR"),
                              m("option", { value: "uah" }, "UAH"),
                            ],
                          ),
                        ]),
                      ]),
                      m(".row.g-3.mt-1", [
                        m(".col-sm-12.col-md-6", [
                          m(
                            "label.form-label",
                            { for: "costModel" },
                            "Cost model",
                          ),
                          m(
                            "select.form-select",
                            {
                              id: "costModel",
                              value: coreCampaignModel.form.costModel,
                              oninput: function (event) {
                                coreCampaignModel.form.costModel =
                                  event.target.value;
                              },
                            },
                            [
                              m("option", { value: "cpc" }, "CPC"),
                              m("option", { value: "cpm" }, "CPM"),
                              m("option", { value: "cpl" }, "CPL"),
                              m("option", { value: "cpa" }, "CPA"),
                              m("option", { value: "cpi" }, "CPI"),
                            ],
                          ),
                        ]),
                      ]),
                      m(".mb-3.mt-3", [
                        m(
                          "label.form-label",
                          { for: "statusMapper" },
                          "Status mapper",
                        ),
                        m("textarea.form-control", {
                          id: "statusMapper",
                          rows: "4",
                          placeholder:
                            '{"approved": "APPROVED", "rejected": "REJECTED"}',
                          value: coreCampaignModel.form.statusMapperText,
                          oninput: function (event) {
                            coreCampaignModel.form.statusMapperText =
                              event.target.value;
                          },
                        }),
                        m(
                          ".form-text",
                          "JSON object that maps internal statuses to external values.",
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
        m(".col-12.col-xl-6", [
          m(".bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", "Flows"),
            m("div", "flows"),
          ]),
        ]),
      ]),
    );
  },
};

module.exports = CoreCampaign;
