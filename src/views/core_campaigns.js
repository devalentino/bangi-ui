let m = require("mithril");
let coreCampaignsModel = require("../models/core_campaigns");
let Pagination = require("../components/pagination");

let CoreCampaigns = {
  oninit: function () {
    coreCampaignsModel.fetch();
  },
  onbeforeupdate: function () {
    let pageUrl = parseInt(m.route.param("page"), 10) || 1;
    let pageSizeUrl = parseInt(m.route.param("pageSize"), 10) || 10;
    if (
      pageUrl !== coreCampaignsModel.pagination.page ||
      pageSizeUrl !== coreCampaignsModel.pagination.pageSize
    ) {
      coreCampaignsModel.fetch();
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
                m("h6.mb-0", "Core Campaigns"),
                m(
                  "a.btn.btn-primary.btn-sm",
                  { href: "#!/core/campaigns/new" },
                  "New Campaign",
                ),
              ],
            ),
            coreCampaignsModel.isLoading
              ? m("div", "Loading campaigns...")
              : [
                  coreCampaignsModel.error
                    ? m(".alert.alert-danger", coreCampaignsModel.error)
                    : null,
                  m(
                    "div.table-responsive",
                    m("table.table", [
                      m(
                        "thead",
                        m("tr", [
                          m("th", { scope: "col" }, "ID"),
                          m("th", { scope: "col" }, "Name"),
                          m("th", { scope: "col" }, "Cost Model"),
                          m("th", { scope: "col" }, "Cost Value"),
                          m("th", { scope: "col" }, "Currency"),
                        ]),
                      ),
                      m(
                        "tbody",
                        coreCampaignsModel.items.length === 0
                          ? m("tr", [
                              m(
                                "td.text-center",
                                { colspan: 5 },
                                "No campaigns found.",
                              ),
                            ])
                          : coreCampaignsModel.items.map(function (campaign) {
                              return m("tr", [
                                m("td", campaign.id),
                                m(
                                  "td",
                                  m(
                                    "a",
                                    { href: `#!/core/campaigns/${campaign.id}` },
                                    campaign.name,
                                  ),
                                ),
                                m("td", campaign.costModel),
                                m("td", campaign.costValue),
                                m("td", campaign.currency),
                              ]);
                            }),
                      ),
                    ]),
                  ),
                  m(Pagination, {pagination: coreCampaignsModel.pagination}),
                ],
          ]),
        ]),
      ]),
    );
  },
};

module.exports = CoreCampaigns;
