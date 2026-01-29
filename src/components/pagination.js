var m = require("mithril");

var Pagination = {
  navigate: function(toPage, pagination) {
    let queryParams = Object.assign({}, pagination, {page: toPage});
    delete queryParams.total;

    let route = m.route.get().split("?")[0];
    console.log(route, queryParams);
    m.route.set(route, queryParams);
  },
  view: function (vnode) {
    let pagination = vnode.attrs.pagination;
    let page = pagination.page;
    let totalPages = Math.ceil(pagination.total / pagination.pageSize) + 1;

    return m(
      ".d-flex.align-items-center.justify-content-between.mt-3",
      [
        m(
          "a.nav-item.nav-link",
          {
            type: "button",
            disabled: page <= 1,
            onclick: function () {
              Pagination.navigate(page - 1, pagination)
            },
          },
          "Previous",
        ),
        m("div", `Page ${page} of ${totalPages}`),
        page < totalPages ?
        m(
          "a.nav-item.nav-link",
          {
            type: "button",
            // disabled: page >= totalPages,
            onclick: function () {
              Pagination.navigate(page + 1, pagination)
            },
          },
          "Next",
        )
        :
        m("div"),
      ],
    );
  },
};

module.exports = Pagination;
