let m = require("mithril");
let Sortable = require("sortablejs");


let FlowsOrder = {
  sortable: null,
  items: [],
  onReorderCallback: null,
  _reorderItems: function(oldIndex, newIndex) {
    if (oldIndex === newIndex) {
      return;
    }

    let items = FlowsOrder.items.slice();

    let moved = items.splice(oldIndex, 1)[0];
    items.splice(newIndex, 0, moved);
    FlowsOrder.items = items;

    if (typeof FlowsOrder.onReorderCallback === "function") {
      let mapping = Object.fromEntries(items.map(function (item, index){
        return [item.id, FlowsOrder.items.length - index];
      }));

      FlowsOrder.onReorderCallback(mapping);
    }
  },
  view: function (vnode) {
    FlowsOrder.items = vnode.attrs.flows;
    FlowsOrder.onReorderCallback = vnode.attrs.onReorder;
    let campaignId = vnode.attrs.campaignId;

    if (!campaignId) {
      return m("div.text-muted", "No campaign selected.");
    }

    if (FlowsOrder.items.length === 0) {
      return m("div.text-muted", "No flows found.");
    }

    return m("div", [
      vnode.state.error
        ? m(".alert.alert-danger", vnode.state.error)
        : null,
      m(
        "ul.list-group",
        {
          id: "flows-sortable-list",
          oncreate: function (vnode) {
            Sortable.create(vnode.dom, {
              onEnd: (e) => {
                FlowsOrder._reorderItems(e.oldIndex, e.newIndex);
                m.redraw();
              }
            });
          }
        },
        FlowsOrder.items.map(function (flow, index) {
          return m(
            "li.list-group-item.d-flex.align-items-center.justify-content-between",
            [
              m("div", [
                m(
                  "a.fw-semibold.text-decoration-none",
                  {
                    href:
                      `#!/core/campaigns/${campaignId}/flows/${flow.id}`,
                  },
                  flow.name,
                ),
                m("div.small.text-muted", flow.actionType),
              ]),
              m("span.badge.bg-secondary", `${flow.orderValue}`),
            ],
          );
        }),
      ),
    ]);
  },
};

module.exports = FlowsOrder;
