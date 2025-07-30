var m = require("mithril")
var auth = require("../../src/models/auth")

var username = ""
var password = ""

var SignIn = {
    view: function() {
        return m(".container-fluid",
            m(".row.h-100.align-items-center.justify-content-center", {style: "min-height: 100vh;"},
                m(".col-12.col-sm-8.col-md-6.col-lg-5.col-xl-4",
                    m(".bg-light.rounded.p-4.p-sm-5.my-4.mx-3",
                        [
                            m(".d-flex.align-items-center.justify-content-between.mb-3",
                                m("h3", "SignIn")
                            ),
                            m(".form-floating.mb-3",
                                [
                                    m("input.form-control", {
                                        id: "floatingInput",
                                        placeholder: "username",
                                        oninput: function(event) {
                                            username = event.target.value;
                                        },
                                    }),
                                    m("label", {for: "floatingInput"}, "Username")
                                ]
                            ),
                            m(".form-floating.mb-4",
                                [
                                    m("input.form-control", {
                                        type: "password",
                                        id: "floatingPassword",
                                        placeholder: "Password",
                                        oninput: function(event) {
                                            password = event.target.value;
                                        },
                                    }),
                                    m("label", {for: "floatingPassword"}, "Password")
                                ]
                            ),
                            m("button.btn.btn-primary.py-3.w-100.mb-4", {
                                type: "submit",
                                onclick: function () {
                                    auth.Authentication.signIn(username, password)
                                }
                            }, "Sign In")
                        ]
                    )
                )
            )
        )

    }
}

module.exports = {SignIn}