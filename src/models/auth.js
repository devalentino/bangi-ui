var m = require("mithril");

var STORAGE_KEY = "bangi.auth";

function loadStoredCredentials() {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    var data = JSON.parse(raw);
    if (!data || !data.username || !data.password) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

function persistCredentials(username, password) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ username: username, password: password }),
  );
}

function clearCredentials() {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

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
      url: `${process.env.BACKEND_API_BASE_URL}/auth/authenticate`,
      headers: { Authorization: `Basic ${Authentication.token}` },
    })
      .then(function (result) {
        Authentication.isAuthenticated = true;
        persistCredentials(username, password);
        m.route.set("");
      })
      .catch(function () {
        alert("Failed to authenticate");
        Authentication.isAuthenticated = false;
        Authentication.token = null;
        clearCredentials();
        m.route.set("");
      });
  },

  signOut: function () {
    Authentication.username = null;
    Authentication.password = null;
    Authentication.isAuthenticated = false;
    Authentication.token = null;
    clearCredentials();
    m.route.set("");
    alert("Signed out");
  },
};

var storedCredentials = loadStoredCredentials();
if (storedCredentials) {
  Authentication.username = storedCredentials.username;
  Authentication.password = storedCredentials.password;
  Authentication.token = btoa(
    `${Authentication.username}:${Authentication.password}`,
  );
  Authentication.isAuthenticated = true;
}

module.exports = { Authentication };
