var m = require("mithril");

var sidebar = require("./sidebar");
var navbar = require("./navbar");

var AuthenticatedPage = {
  view: function (vnode) {
    return [
      m(sidebar),
      m(
        ".content",
        [
          m(navbar, { auth: vnode.attrs.auth }),
          m(vnode.attrs.page, vnode.attrs.pageAttrs),
        ],
      ),
    ];
  },
};

module.exports = AuthenticatedPage;
