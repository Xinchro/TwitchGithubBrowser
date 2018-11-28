// DOM elements
var usernameDOM = document.getElementById('config-username')
var repoDOM = document.getElementById('config-repo')
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

  // remove all spaces from username and repo
  var user = removeSpaces(usernameDOM.value)
  var repo = removeSpaces(repoDOM.value)

  var URL = "//api.github.com/repos/"+user+"/"+repo+"/contents/"

  // send off a request to Github
  var xhttp = new XMLHttpRequest()
  xhttp.open("GET", URL, false)
  xhttp.send()

  try {
    var data = JSON.parse(xhttp.responseText)  
  } catch(e) {
    console.error("failed to parse JSON")
    console.error(e)
    throw(e)
  }

  // check to make sure the user/repo combo works
  if(data.message && data.message.toLowerCase() === "not found") {
    showUserRepoError()
  } else {
    // save broadcaster settings as de-spaced values
    twitch.configuration.set('broadcaster', '0.1', JSON.stringify({ user: user, repo: repo }))

    showSaveConfirmation()
  }
}

/**
  Shows the save confirmation
*/
function showSaveConfirmation() {
  // show confirmation
  applyBtnDOM.classList.add('confirm')

  // make the vanish after 1s
  confirmTimeout = setTimeout(function() {
    applyBtnDOM.classList.remove('confirm')
  }, 1000) 
}

/**
  Shows the save confirmation
*/
function showUserRepoError() {
  // show confirmation
  applyBtnDOM.classList.add('userRepoError')

  // make the vanish after 1s
  confirmTimeout = setTimeout(function() {
    applyBtnDOM.classList.remove('userRepoError')
  }, 1000) 
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
  usernameDOM.value = removeSpaces(broadcaster.user)
  repoDOM.value = removeSpaces(broadcaster.repo)
}

// ***** bindings ***** //
applyBtnDOM.addEventListener('click', function() {
  applyChanges()
});