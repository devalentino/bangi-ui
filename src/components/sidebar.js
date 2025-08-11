var m = require("mithril");

var Sidebar = {
  view: function () {
    return m(
      ".sidebar.pe-4.pb-3",
      m(
        ".sidebar.pe-4.pb-3",
        m("nav.navbar.bg-light.navbar-light", [
          m(
            "a.navbar-brand.mx-4.mb-3",
            { href: "index.html" },
            m("h3.text-primary", [m("i.fa.fa-hashtag.me-2"), "Bangi"]),
          ),
          m(
            ".navbar-nav.w-100",
            m("a.nav-item.nav-link.active", { href: "#!/" }, [
              m("i.fa.fa-tachometer-alt.me-2"),
              "Statistics",
            ]),
          ),
        ]),
      ),
    );
  },
};

module.exports = Sidebar;
