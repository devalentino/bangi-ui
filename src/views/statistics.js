var m = require("mithril");

var statistics = require("../components/statistics");

var Statistics = {
  view: function () {
    return [m(statistics.Filter), m(statistics.Chart), m(statistics.Table)];
  },
};

module.exports = { Statistics };
