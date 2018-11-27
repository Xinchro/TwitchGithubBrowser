var twitch = window.Twitch.ext;

var username = document.getElementById('config-username')
var repo = document.getElementById('config-repo')

twitch.onAuthorized(authenticated)
twitch.configuration.onChanged(loadData)
console.log("loading conifg page")

function authenticated(auth) {
}

function loadData() {
  updateInputs(twitch.configuration)
}

function applyChanges() {
  console.log("applying")
  twitch.configuration.set('broadcaster', '0.1', JSON.stringify({ user: removeSpaces(username.value), repo: removeSpaces(repo.value) }))
}

document.getElementById('apply-btn').addEventListener('click', function() {
  applyChanges()
});

function updateInputs(data) {
  console.log("updating inputs")
  console.log(data.broadcaster)
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }
  username.value = removeSpaces(broadcaster.user)
  repo.value = removeSpaces(broadcaster.repo)
}