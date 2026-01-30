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
            [
              m("a.nav-item.nav-link", { href: "#!/statistics" }, [
                m("i.fa.fa-tachometer-alt.me-2"),
                "Statistics",
              ]),
              m("a.nav-item.nav-link", { href: "#!/core/campaigns" }, [
                m("i.fa.fa-bullhorn.me-2"),
                "Campaigns",
              ]),
              m("a.nav-item.nav-link", { href: "#!/core/flows" }, [
                m("i.fa.fa-stream.me-2"),
                "Flows",
              ]),
            ],
          ),
        ]),
      ),
    );
  },
};

module.exports = Sidebar;
