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
  // _initSortable: function () {
  //   console.log('_initSortable');
  //   if (FlowsOrder.sortable !== null) {
  //     return;
  //   }
  //
  //   let sortableList = document.getElementById("flows-sortable-list");
  //   if (sortableList === null) {
  //     return;
  //   }
  //
  //   FlowsOrder.sortable = new sortable(sortableList, {
  //     animation: 150, // CSS animation when moving items
  //     onEnd: function (evt) {
  //       FlowsOrder._reorderItems(evt.oldIndex, evt.newIndex);
  //     },
  //   });
  //
  //   console.log('sortable is set', FlowsOrder.items);
  // },
  // init: function () {
  //   FlowsOrder._initSortable();
  // },
  // onbeforeupdate: function () {
  //   FlowsOrder._initSortable();
  // },
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
                m("div.fw-semibold", flow.name),
                m("div.small.text-muted", flow.id),
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
