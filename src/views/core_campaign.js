let m = require("mithril");
let coreCampaignModel = require("../models/core_campaign");
let coreFlowsModel = require("../models/core_flows");
let Flows = require("../components/flows");

let CoreCampaign = {
  oninit: function () {
    let campaignId = m.route.param("campaignId");

    if (campaignId && campaignId !== "new") {
      coreCampaignModel.fetch(campaignId);
      coreFlowsModel.fetch(campaignId, {
        page: 1,
        pageSize: 1000,
        sortBy: "orderValue",
        sortOrder: "desc"
      });
    }
  },
  onbeforeupdate: function () {
    let campaignId = m.route.param("campaignId");

    if (campaignId && campaignId !== coreCampaignModel.campaignId) {
      coreCampaignModel.fetch(campaignId);
      if (campaignId !== "new") {
        coreFlowsModel.fetch(campaignId, {
          page: 1,
          pageSize: 1000,
          sortBy: "orderValue",
          sortOrder: "desc"
        });
      } else {
        coreFlowsModel.items = [];
        coreFlowsModel.error = null;
        coreFlowsModel.isLoading = false;
      }
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
                        coreCampaignModel.save();
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
                          placeholder: "Campaign Name",
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
                            '{"parameter":"state","mapping":{"approved":"APPROVED","rejected":"REJECTED"}}',
                          value: coreCampaignModel.form.statusMapperText,
                          oninput: function (event) {
                            coreCampaignModel.form.statusMapperText =
                              event.target.value;
                          },
                        }),
                        m(
                          ".form-text",
                          "JSON with parameter string and mapping object (string to string).",
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
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              [
                m("h6.mb-0", "Flows"),
                m(
                  "a.btn.btn-primary.btn-sm",
                  {
                    href: coreCampaignModel.campaignId
                      && coreCampaignModel.campaignId !== "new"
                      ? `#!/core/campaigns/${coreCampaignModel.campaignId}/flows/new`
                      : "#",
                    disabled:
                      !coreCampaignModel.campaignId
                      || coreCampaignModel.campaignId === "new",
                  },
                  "New Flow",
                ),
              ],
            ),
            coreFlowsModel.isLoading
              ? m("div", "Loading flows...")
              : [
                  coreFlowsModel.error
                    ? m(".alert.alert-danger", coreFlowsModel.error)
                    : null,
                  m(Flows, {
                    campaignId: coreCampaignModel.campaignId,
                    flows: coreFlowsModel.items,
                    onReorder: function (mapping) {
                      coreFlowsModel.updateOrderBulk(coreCampaignModel.campaignId, mapping);
                    }
                  }),
                ],
          ]),
        ]),
      ]),
    );
  },
};

module.exports = CoreCampaign;
