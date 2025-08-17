var m = require("mithril");
var ChartJS = require("chart.js/auto");

var Chart = {
  chartInstance: null,

  oncreate: function ({ dom, attrs }) {
    const ctx = dom.getContext("2d");
    Chart.chartInstance = new ChartJS(ctx, attrs.chartOptions);
  },

  onupdate: function ({ attrs }) {
    if (Chart.chartInstance) {
      Chart.chartInstance.data = attrs.chartOptions.data;
      Chart.chartInstance.options = attrs.chartOptions.options;
      Chart.chartInstance.update();
    }
  },

  onremove: function () {
    if (Chart.chartInstance) {
      Chart.chartInstance.destroy();
    }
  },

  view: function () {
    return m("canvas");
  },
};

module.exports = Chart;
