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

class AuthModel {
  constructor() {
    this.username = null;
    this.password = null;
    this.isAuthenticated = false;
    this.token = null;

    var storedCredentials = loadStoredCredentials();
    if (storedCredentials) {
      this.username = storedCredentials.username;
      this.password = storedCredentials.password;
      this.token = btoa(
        this.username + ":" + this.password,
      );
      this.isAuthenticated = true;
    }
  }

  signIn(username, password) {
    this.username = username;
    this.password = password;

    this.token = btoa(
      this.username + ":" + this.password,
    );

    m.request({
      method: "POST",
      url: process.env.BACKEND_API_BASE_URL + "/auth/authenticate",
      headers: { Authorization: "Basic " + this.token },
    })
      .then(function () {
        this.isAuthenticated = true;
        persistCredentials(username, password);
        m.route.set("");
      }.bind(this))
      .catch(function () {
        alert("Failed to authenticate");
        this.isAuthenticated = false;
        this.token = null;
        clearCredentials();
        m.route.set("");
      }.bind(this));
  }

  signOut() {
    this.username = null;
    this.password = null;
    this.isAuthenticated = false;
    this.token = null;
    clearCredentials();
    m.route.set("");
    alert("Signed out");
  }
}

module.exports = AuthModel;
