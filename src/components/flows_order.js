let m = require("mithril");


let FlowsOrder = {
  view: function (vnode) {
    let items = vnode.attrs.flows;
    let campaignId = vnode.attrs.campaignId;

    if (!campaignId) {
      return m("div.text-muted", "No campaign selected.");
    }

    if (items.length === 0) {
      return m("div.text-muted", "No flows found.");
    }

    return m("div", [
      vnode.state.error
        ? m(".alert.alert-danger", vnode.state.error)
        : null,
      m(
        "ul.list-group",
        items.map(function (flow, index) {
          return m(
            "li.list-group-item.d-flex.align-items-center.justify-content-between",
            [
              m("div", [
                m("div.fw-semibold", flow.name),
                m("div.small.text-muted", flow.campaignName),
              ]),
              m("span.badge.bg-secondary", `#${index + 1}`),
            ],
          );
        }),
      ),
    ]);
  },
};

module.exports = FlowsOrder;
