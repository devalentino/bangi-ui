let m = require("mithril");
let coreFlowModel = require("../models/core_flow");

let CoreFlow = {
  oninit: function () {
    let flowId = m.route.param("flowId");
    let campaignId = m.route.param("campaignId");

    if (flowId !== "new") {
      coreFlowModel.fetch(flowId, campaignId);
    }
  },
  onbeforeupdate: function () {
    let flowId = m.route.param("flowId");
    let campaignId = m.route.param("campaignId");

    if (
      flowId && flowId !== "new"
      && (flowId !== coreFlowModel.flowId || campaignId !== coreFlowModel.campaignId)
    ) {
      coreFlowModel.fetch(flowId, campaignId);
    }
  },
  view: function () {
    let isNew = coreFlowModel.flowId === "new";

    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12.col-xl-6", [
          m(".bg-light.rounded.h-100.p-4", [
            m("h6.mb-4", isNew ? "New Flow" : "Flow Modification"),
            coreFlowModel.isLoading
              ? m("div", "Loading flow...")
              : [
                  coreFlowModel.error
                    ? m(".alert.alert-danger", coreFlowModel.error)
                    : null,
                  coreFlowModel.successMessage
                    ? m(".alert.alert-success", coreFlowModel.successMessage)
                    : null,
                  m(
                    "form",
                    {
                      onsubmit: function (event) {
                        event.preventDefault();
                        coreFlowModel.save();
                      },
                      onreset: function (event) {
                        event.preventDefault();
                        coreFlowModel.resetForm();
                      },
                    },
                    [
                      m("input.form-control", {
                        type: "hidden",
                        id: "orderValue",
                        value: coreFlowModel.form.orderValue || "0",
                        oninput: function () {},
                      }),
                      m(".row.g-3", [
                        m(".col-sm-12", [
                          m("label.form-label", { for: "flowName" }, "Name"),
                          m("input.form-control", {
                            type: "text",
                            id: "flowName",
                            placeholder: "Enter flow name",
                            value: coreFlowModel.form.name,
                            oninput: function (event) {
                              coreFlowModel.form.name = event.target.value;
                            },
                          }),
                        ]),
                        m(".col-sm-12", [
                          m("ul.nav.nav-tabs", [
                            m("li.nav-item", [
                              m(
                                "button.nav-link",
                                {
                                  type: "button",
                                  class:
                                    coreFlowModel.form.actionType === "redirect"
                                      ? "active"
                                      : "",
                                  onclick: function () {
                                    coreFlowModel.form.actionType = "redirect";
                                    coreFlowModel.form.landingArchive = null;
                                  },
                                },
                                "Redirect",
                              ),
                            ]),
                            m("li.nav-item", [
                              m(
                                "button.nav-link",
                                {
                                  type: "button",
                                  class:
                                    coreFlowModel.form.actionType === "render"
                                      ? "active"
                                      : "",
                                  onclick: function () {
                                    coreFlowModel.form.actionType = "render";
                                    coreFlowModel.form.redirectUrl = null;
                                  },
                                },
                                "Render",
                              ),
                            ]),
                          ]),
                        ]),
                      ]),
                      m(".row.g-3.mt-1", [
                        m(".col-sm-12.col-md-6", [
                          coreFlowModel.form.actionType === "redirect"
                            ? [
                                m(
                                  "label.form-label",
                                  { for: "redirectUrl" },
                                  "Redirect URL",
                                ),
                                m("input.form-control", {
                                  type: "url",
                                  id: "redirectUrl",
                                  placeholder: "https://example.com",
                                  value: coreFlowModel.form.redirectUrl,
                                  oninput: function (event) {
                                    coreFlowModel.form.redirectUrl =
                                      event.target.value;
                                  },
                                }),
                              ]
                            : [
                                m(
                                  "label.form-label",
                                  { for: "renderFile" },
                                  "Render file",
                                ),
                                m("input.form-control", {
                                  type: "file",
                                  id: "renderFile",
                                  onchange: function (event) {
                                    coreFlowModel.form.landingArchive =
                                      event.target.files[0] || null;
                                  },
                                }),
                                m("label.form-label mt-3", "Landing path"),
                                m(
                                  "div.form-control-plaintext",
                                  coreFlowModel.form.landingPath || "-",
                                ),
                              ],
                        ]),
                      ]),
                      m(".mb-3.mt-3", [
                        m("label.form-label", { for: "flowRule" }, "Rule"),
                        m("textarea.form-control", {
                          id: "flowRule",
                          rows: "4",
                          placeholder: "Enter flow rule",
                          value: coreFlowModel.form.rule,
                          oninput: function (event) {
                            coreFlowModel.form.rule = event.target.value;
                          },
                        }),
                      ]),
                      m(".form-check.mt-3", [
                        m("input.form-check-input", {
                          type: "checkbox",
                          id: "isEnabled",
                          checked: coreFlowModel.form.isEnabled,
                          onchange: function (event) {
                            coreFlowModel.form.isEnabled = event.target.checked;
                          },
                        }),
                        m(
                          "label.form-check-label",
                          { for: "isEnabled" },
                          "Enabled",
                        ),
                      ]),
                      m(
                        "button.btn.btn-primary.mt-3",
                        { type: "submit" },
                        "Save changes",
                      ),
                      m(
                        "button.btn.btn-secondary.mt-3.ms-2",
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
  },
};

module.exports = CoreFlow;
