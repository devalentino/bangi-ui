m = require("mithril");

var Authentication = {
  username: null,
  password: null,
  isAuthenticated: false,
  token: null,

  signIn: function (username, password) {
    Authentication.username = username;
    Authentication.password = password;

    Authentication.token = btoa(
      `${Authentication.username}:${Authentication.password}`,
    );

    m.request({
      method: "POST",
      url: "http://i-cosanzeana.me/api/v2/auth/authenticate",
      headers: { Authorization: `Basic ${Authentication.token}` },
    })
      .then(function (result) {
        Authentication.isAuthenticated = true;
        m.route.set("");
      })
      .catch(function () {
        alert("Failed to authenticate");
        Authentication.isAuthenticated = false;
        m.route.set("");
      });
  },

  signOut: function () {
    Authentication.username = null;
    Authentication.password = null;
    Authentication.isAuthenticated = false;
    m.route.set("");
    alert("Signed out");
  },
};

module.exports = { Authentication };
