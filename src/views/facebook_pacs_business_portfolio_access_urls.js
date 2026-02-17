let m = require("mithril");
let FacebookPacsBusinessPortfolioAccessUrlsModel = require("../models/facebook_pacs_business_portfolio_access_urls");
let Pagination = require("../components/pagination");

class FacebookPacsBusinessPortfolioAccessUrlsView {
  constructor() {
    this.businessPortfolioId = m.route.param("businessPortfolioId");
    this.model = new FacebookPacsBusinessPortfolioAccessUrlsModel(
      this.businessPortfolioId,
    );
  }

  oninit() {
    this.model.fetch();
  }

  handleDelete(accessUrlId) {
    if (!window.confirm("Delete this access URL?")) {
      return;
    }

    this.model
      .deleteAccessUrl(accessUrlId)
      .then(function () {
        this.model.fetch();
      }.bind(this))
      .catch(function () {
        this.model.error = "Failed to delete access URL.";
      }.bind(this));
  }

  view() {
    return m(
      ".container-fluid.pt-4.px-4",
      m(".row.g-4", [
        m(".col-12", [
          m(".bg-light.rounded.h-100.p-4", [
            m(
              ".d-flex.align-items-center.justify-content-between.mb-4",
              [
                m("h6.mb-0", "Business Portfolio Access URLs"),
                m(
                  "a.btn.btn-primary.btn-sm",
                  {
                    href: `#!/facebook/pacs/business-portfolios/${this.businessPortfolioId}/access-urls/new`,
                  },
                  "New Access URL",
                ),
              ],
            ),
            this.model.isLoading
              ? m("div", "Loading access URLs...")
              : [
                  this.model.error
                    ? m(".alert.alert-danger", this.model.error)
                    : null,
                  m(
                    "div.table-responsive",
                    m("table.table", [
                      m(
                        "thead",
                        m("tr", [
                          m("th", { scope: "col" }, "ID"),
                          m("th", { scope: "col" }, "URL"),
                          m("th", { scope: "col" }, "Expires At"),
                          m("th", { scope: "col" }, "Actions"),
                        ]),
                      ),
                      m(
                        "tbody",
                        this.model.items.length === 0
                          ? m("tr", [
                              m(
                                "td.text-center",
                                { colspan: 4 },
                                "No access URLs found.",
                              ),
                            ])
                          : this.model.items.map(function (accessUrl) {
                              return m("tr", [
                                m("td", accessUrl.id),
                                m("td", accessUrl.url),
                                m("td", accessUrl.expiresAt),
                                m(
                                  "td",
                                  m(
                                    "button.btn.btn-outline-danger.btn-sm",
                                    {
                                      type: "button",
                                      onclick: function () {
                                        this.handleDelete(accessUrl.id);
                                      }.bind(this),
                                    },
                                    "Delete",
                                  ),
                                ),
                              ]);
                            }.bind(this)),
                      ),
                    ]),
                  ),
                  m(Pagination, { pagination: this.model.pagination }),
                ],
          ]),
        ]),
      ]),
    );
  }
}

module.exports = FacebookPacsBusinessPortfolioAccessUrlsView;
