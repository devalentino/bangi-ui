var m = require("mithril");

var sidebar = require("./sidebar");
var navbar = require("./navbar");

var AuthenticatedPage = {
  view: function (vnode) {
    return [m(sidebar), m(".content", [m(navbar), m(vnode.attrs.page)])];
  },
};

module.exports = AuthenticatedPage;
