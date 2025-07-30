var m = require("mithril")
var sidebar = require("../../components/sidebar")
var navbar = require("../../components/navbar")

var Statistics = {
    view: function() {
        return [
            m(sidebar),
            m(".content", [
                m(navbar),
                m("p", "Hello, Statistics")
            ])
        ]
    }
}

module.exports = {Statistics}