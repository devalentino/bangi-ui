m = require("mithril")

var Authentication = {
    username: null,
    password: null,
    isAuthenticated: false,

    signIn: function(username, password) {
        Authentication.username = username
        Authentication.password = password

        let token = btoa(`${Authentication.username}:${Authentication.password}`)

        m.request({
            method: "POST",
            url: "http://i-cosanzeana.me/api/v2/auth/authenticate",
            headers: {'Authorization': `Basic ${token}`}
        })
        .then(function(result) {
            Authentication.isAuthenticated = true
            m.route.set('')
        })
        .catch(function(){
            alert('Failed to authenticate')
            Authentication.isAuthenticated = false
            m.route.set('')
        })
    },

    signOut: function() {
        Authentication.username = null
        Authentication.password = null
        Authentication.isAuthenticated = false
        m.route.set('')
        alert('Signed out')
    }
}

module.exports = {Authentication}