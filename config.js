// DOM elements
var usernameDOM = document.getElementById('config-username')
var repoDOM = document.getElementById('repo-select')
var applyBtnDOM = document.getElementById('apply-btn')

var usernameTimeout

twitch.configuration.onChanged(loadData)

// reset the repo input to element 0, if one was chosen before (gone now)
if(!repoDOM.selectedIndex || repoDOM.selectedIndex < 0) repoDOM.value = 0

// clean username element and disabled repo select
usernameDOM.clean = true
repoDOM.disabled = true

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
  if(repoDOM.options.selectedIndex == 0) throw "No repo selected"

  //clears the timeout
  clearTimeout(confirmTimeout)

  // remove all spaces from username and repo
  var user = removeSpaces(usernameDOM.value)
  var repo = removeSpaces(getChosenRepo())

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
  if(xhttp.status == 404 || xhttp.status == 403) {
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

/**
  Update the various inputs on the config page with relevant data
*/
function updateInputs(data) {
  // try parse, set used data to "error" if failed
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
  } catch(e) {
    var broadcaster = { user: "error", repo: "error" }
  }

  updateUsername(removeSpaces(broadcaster.user))
  updateRepo(removeSpaces(broadcaster.repo))
}

/**
  Updates the username to given text
  @params {String} text - the text to update the username to
*/
function updateUsername(text) {
  if(!text || text === '') throw "bad username to update"
  usernameDOM.value = text
}

/**
  Fetches repositories for the given username
  @params {String} user - the username
  @returns {Array} - an array of repo names
*/
function getRepos(user) {
  if(!user || user === '') throw "bad user to fetch"

  // repo listing endpoint
  var URL = "//api.github.com/users/"+user+"/repos"

  // send off a request to Github
  var xhttp = new XMLHttpRequest()
  xhttp.open("GET", URL, false)
  xhttp.send()

  try {
    var data = JSON.parse(xhttp.responseText)  
  } catch(e) {
    console.error("failed to parse repos JSON")
    console.error(e)
    throw(e)
  }

  // error checking
  if(xhttp.state == 404) throw "incorrect username / repos not found"
  if(xhttp.status == 403) throw "rate limited"

  // return just the repo names as an array
  return data.map(function(ele) { return ele.name })
}

/**
  Clears the repo select
*/
function clearRepoSelect() {
  // clear the list
  while (repoDOM.firstChild) {
    repoDOM.removeChild(repoDOM.firstChild);
  }

  repoDOM.disabled = true

  var def = document.createElement("option")
  def.text = "Add username"
  def.value = 0
  def.disabled = true
  def.selected = true

  // re-add the default option
  repoDOM.add(def)
}

/**
  Selects the given repo
  @params {String} name - the name of the repo to select
*/
function updateRepo(name) {
  if(name && name != '') {
    var repos = getRepos(usernameDOM.value)
    // get repo list
    updateRepoSelect(repos)
    
    // update selection
    repoDOM.value = getRepoIndex(repos, name) + 1 // because of default option

    repoDOM.disabled = false
  } else {
    repoDOM.value = 0
    throw "bad repo name: " + name
  }
}

/**
  Updates the repo select with the provided array of names
  @params {Array} repos - the repo names to display
*/
function updateRepoSelect(repos) {
  // only do anything if we actually have repos
  if(repos && repos.length > 0) {
    repos.forEach(function(ele, index) {
      var opt = document.createElement("option")
      opt.text = ele
      opt.value = index + 1 // because of default option
      repoDOM.add(opt)
    })

    if(!usernameDOM.clean) repoDOM.disabled = false
    
    updateRepoSelectNumber(repos.length)
  }
}

/**
  Updates the number in the repo select's default option
  @params {Number} number - the number to set it to
*/
function updateRepoSelectNumber(number) {
  repoDOM.options[0].text = "Select one(" + number + ")"
}

/**
  Gets the name of the repo chosen in the repo select
*/
function getChosenRepo() {
  if(repoDOM.options.selectedIndex == 0) throw "Please select a repo"

  return repoDOM.options[repoDOM.options.selectedIndex].text
}

/**
  Gets the repo index based on the name
  @param {Array} arr - the array of repos
  @param {String} name - the name of the repo
  @return {Number} - the index of the repo in the select options
*/
function getRepoIndex(arr, name) {
  return arr.findIndex(function(ele){ return ele === name })
}

// ***** bindings ***** //
applyBtnDOM.addEventListener('click', function() {
  applyChanges()
})

usernameDOM.addEventListener("input", function() {
  if(usernameDOM.clean) usernameDOM.clean = false

  clearTimeout(usernameTimeout)
  usernameTimeout = setTimeout(function() {
    clearRepoSelect()
    updateRepoSelect(getRepos(usernameDOM.value))
  }, 300)
})