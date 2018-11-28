// initial variable setup
var dirs = []
var repoURL = "//github.com"
var URL = "//github.com"

// DOM elements
var browserListDOM = document.getElementById('browser-list')
var userDOM = document.getElementById("user")
var repoDOM = document.getElementById("repo")
var backBtnDOM = document.getElementById('goBack-btn')

twitch.configuration.onChanged(loadData)

/**
  Loads the configuration from Twitch(callback)
*/
function loadData() {
  // set all our variables
  setVars(twitch.configuration)
  // do an initial browse to `/`(root)
  navigate()
  // remove our loading element from the DM
  removeElement("repo-loading")
}

/**
  Sets up all our variables in the document. Links and such.
  @params {Object} data - the data object we recieved from Twitch
*/
function setVars(data) {
  // try parse the incoming data, else set used data to "error"
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }

  // unpad the username and repository name
  var user = removeSpaces(broadcaster.user)
  var repo = removeSpaces(broadcaster.repo)

  // set our Github links
  repoURL = "//github.com/"+user+"/"+repo+"/"
  URL = "//api.github.com/repos/"+user+"/"+repo+"/contents/"

  // set our user and repo links in the DOM
  userDOM.href = "//github.com/"+user
  repoDOM.href = "//github.com/"+user+"/"+repo
}

/**
  Go up in the directory structure
*/
function goBack() {
  // remove latest from directory arrays
  dirs.pop()
  // browse to our new route
  navigate()
}

/**
  Navigates to the given directory
  @params {String} directory - the directory to navigate to
*/
function navDir(directory) {
  // add the directory to our path array
  dirs.push(directory)
  // browse to the new directory
  navigate()
}

/**
  Browses to the route based on the path array
*/
function navigate() {
  // request to Github to get our current directory structure, based on our directory array
  var xhttp = new XMLHttpRequest()
  xhttp.open("GET", URL + dirs.join('/'), false)
  xhttp.send()
  
  // try parse the respose, fail is we can't
  try {
    var data = JSON.parse(xhttp.responseText)  
  } catch(e) {
    console.error("failed to parse JSON")
    console.error(e)
    throw(e)
  }
  
  // clear our browser list
  browserListDOM.innerHTML = ''

  // loop through the Github response's elements (files, folders, etc.)
  for(var i=0;i<data.length;i++) {
    // check element type and act accordingly
    if(data[i].type.toLowerCase() === 'file') {
      // add that element to the browsing list in the appropriate manner
      browserListDOM.innerHTML += '<li class="browser-element"><a class="file" target="_blank" href="' + data[i]._links.html + '"><div class="icon">&#x1f517;</div>' + data[i].name + "</a></li>"
    }

    if(data[i].type.toLowerCase() === 'dir') {
      browserListDOM.innerHTML += '<li class="browser-element"><button class="dir" id="' + data[i].name + '-btn"><div class="icon">&#x1f4c2;</div>' + data[i].name + '</button></li>'

      // timeout here becuase the DOM can't keep up with itself
      // so, bind a click after 100 milliseconds, to make sure the element is there
      setTimeout(function(name){
        document.getElementById(name + '-btn').addEventListener('click', function() {
          navDir(name)
        })
      }, 100, data[i].name)
    }
  }
}

// ***** bindings ***** //
backBtnDOM.addEventListener('click', function() {
  goBack()
})