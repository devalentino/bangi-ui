let m = require("mithril");
let Sortable = require("sortablejs");


let Flows = {
  items: [],
  onReorderCallback: null,
  _reorderItems: function(oldIndex, newIndex) {
    if (oldIndex === newIndex) {
      return;
    }

    let items = Flows.items.slice();

    let moved = items.splice(oldIndex, 1)[0];
    items.splice(newIndex, 0, moved);
    Flows.items = items;

    if (typeof Flows.onReorderCallback === "function") {
      let mapping = Object.fromEntries(items.map(function (item, index){
        return [item.id, items.length - index];
      }));

      Flows.onReorderCallback(mapping);
    }
  },
  view: function (vnode) {
    Flows.items = vnode.attrs.flows;
    Flows.onReorderCallback = vnode.attrs.onReorder;
    let campaignId = vnode.attrs.campaignId;

    if (Flows.items.length === 0) {
      return m("div.text-muted", "No flows found.");
    }

    return m("div", [
      vnode.state.error
        ? m(".alert.alert-danger", vnode.state.error)
        : null,
      m(
        "ul.list-group",
        {
          oncreate: function (vnode) {
            Sortable.create(vnode.dom, {
              onEnd: (e) => {
                Flows._reorderItems(e.oldIndex, e.newIndex);
                m.redraw();
              }
            });
          }
        },
        Flows.items.map(function (flow, index) {
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

module.exports = Flows;
