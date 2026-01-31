let m = require("mithril");
let Sortable = require("sortablejs");

class Flows {
  constructor() {
    this.items = [];
    this.onReorderCallback = null;
  }

  _reorderItems(oldIndex, newIndex) {
    if (oldIndex === newIndex) {
      return;
    }

    let items = this.items.slice();

    let moved = items.splice(oldIndex, 1)[0];
    items.splice(newIndex, 0, moved);
    this.items = items;

    if (typeof this.onReorderCallback === "function") {
      let mapping = Object.fromEntries(items.map(function (item, index) {
        return [item.id, index + 1];
      }));

      this.onReorderCallback(mapping);
    }
  }

  view(vnode) {
    this.items = vnode.attrs.flows;
    this.onReorderCallback = vnode.attrs.onReorder;
    let campaignId = vnode.attrs.campaignId;

    if (this.items.length === 0) {
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
              onEnd: function (e) {
                this._reorderItems(e.oldIndex, e.newIndex);
                m.redraw();
              }.bind(this),
            });
          }.bind(this),
        },
        this.items.map(function (flow) {
          return m(
            "li.list-group-item.d-flex.align-items-center.justify-content-between",
            {
              class: flow.isEnabled ? "" : "flows-item-disabled",
            },
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
                m(
                  "div.small.text-muted",
                  m("i", {
                    class:
                      flow.actionType === "render"
                        ? "fa fa-file-alt"
                        : "fa fa-external-link-alt",
                    title: flow.actionType || "Action",
                  }),
                ),
              ]),
              m(
                "span.badge.bg-secondary",
                m("i", {
                  class: flow.isEnabled ? "fa fa-check" : "fa fa-ban",
                  title: flow.isEnabled ? "Enabled" : "Disabled",
                }),
              ),
            ],
          );
        }),
      ),
    ]);
  }
}

module.exports = Flows;
