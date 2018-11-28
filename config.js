// DOM elements
var username = document.getElementById('config-username')
var repo = document.getElementById('config-repo')
var applyBtnDOM = document.getElementById('apply-btn')

twitch.configuration.onChanged(loadData)

/**
  Load the data from Twitch(callback)
*/
function loadData() {
  // update the inputs with the most up-to-date data
  updateInputs(twitch.configuration)
}

var confirmTimeout

/**
  Apply the changes to Twitch
*/
function applyChanges() {
  //clears the timeout
  clearTimeout(confirmTimeout)

  // save broadcaster settings as unpadded values
  twitch.configuration.set('broadcaster', '0.1', JSON.stringify({ user: removeSpaces(username.value), repo: removeSpaces(repo.value) }))

  // show confirmation
  applyBtnDOM.classList.add('confirm')

  // make the vanish after 500ms
  confirmTimeout = setTimeout(function() {
    applyBtnDOM.classList.remove('confirm')
  }, 500) 
}

// update the various inputs on the config page with relevant data
function updateInputs(data) {
  // try parse, set used data to "error" if failed
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }

  // set the inputs' texts to their relevant data
  username.value = removeSpaces(broadcaster.user)
  repo.value = removeSpaces(broadcaster.repo)
}

// ***** bindings ***** //
applyBtnDOM.addEventListener('click', function() {
  applyChanges()
});