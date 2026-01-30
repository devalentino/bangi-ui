let m = require("mithril");
let coreFlowsModel = require("../models/core_flows");
let Pagination = require("../components/pagination");

let CoreFlows = {
  oninit: function () {
    coreFlowsModel.fetch();
  },
  onbeforeupdate: function () {
    let pageUrl = parseInt(m.route.param("page"), 10) || 1;
    let pageSizeUrl = parseInt(m.route.param("pageSize"), 10) || 10;
    if (
      pageUrl !== coreFlowsModel.pagination.page ||
      pageSizeUrl !== coreFlowsModel.pagination.pageSize
    ) {
      coreFlowsModel.fetch();
    }
  },
  view: function () {
    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12", [
          m(".bg-light.rounded.h-100.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              [
                m("h6.mb-0", "Core Flows"),
                m(
                  "a.btn.btn-primary.btn-sm",
                  { href: "#!/core/flows/new" },
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
                  m(
                    "div.table-responsive",
                    m("table.table", [
                      m(
                        "thead",
                        m("tr", [
                          m("th", { scope: "col" }, "Name"),
                          m("th", { scope: "col" }, "Campaign"),
                          m("th", { scope: "col" }, "Action"),
                          m("th", { scope: "col" }, "Enabled"),
                        ]),
                      ),
                      m(
                        "tbody",
                        coreFlowsModel.items.length === 0
                          ? m("tr", [
                              m(
                                "td.text-center",
                                { colspan: 5 },
                                "No flows found.",
                              ),
                            ])
                          : coreFlowsModel.items.map(function (flow) {
                              return m("tr", [
                                m(
                                  "td",
                                  m(
                                    "a",
                                    { href: `#!/core/flows/${flow.id}` },
                                    flow.name || flow.id,
                                  ),
                                ),
                                m(
                                  "td",
                                  flow.campaignId
                                    ? m(
                                        "a",
                                        {
                                          href: `#!/core/campaigns/${flow.campaignId}`,
                                        },
                                        flow.campaignName || flow.campaignId,
                                      )
                                    : "-",
                                ),
                                m("td", flow.actionType),
                                m("td", flow.isEnabled ? "Yes" : "No"),
                              ]);
                            }),
                      ),
                    ]),
                  ),
                  m(Pagination, { pagination: coreFlowsModel.pagination }),
                ],
          ]),
        ]),
      ]),
    );
  },
};

module.exports = CoreFlows;
