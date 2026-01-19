var m = require("mithril");
var ChartJS = require("chart.js/auto");

function Chart() {
  this.chartInstance = null;

  this.oncreate = function ({ dom, attrs }) {
    const ctx = dom.getContext("2d");
    this.chartInstance = new ChartJS(ctx, attrs.chartOptions);
  };

  this.onupdate = function ({ attrs }) {
    if (this.chartInstance) {
      this.chartInstance.data = attrs.chartOptions.data;
      this.chartInstance.options = attrs.chartOptions.options;
      this.chartInstance.update();
    }
  };

  this.onremove = function () {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  };

  this.view = function () {
    return m("canvas");
  };

  return this;
};

module.exports = Chart;
