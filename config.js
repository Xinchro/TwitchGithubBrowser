var twitch = window.Twitch.ext;

var username = document.getElementById('config-username')
var repo = document.getElementById('config-repo')

twitch.onAuthorized(authenticated)
twitch.configuration.onChanged(loadData)

function authenticated(auth) {
}

function loadData() {
  updateInputs(twitch.configuration)
}

function apply() {
  twitch.configuration.set('broadcaster', '0.1', JSON.stringify({ user: username.value, repo: repo.value }))
}

function updateInputs(data) {
  console.log("updating inputs")
  console.log(data.broadcaster)
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }
  username.value = broadcaster.user
  repo.value = broadcaster.repo
}