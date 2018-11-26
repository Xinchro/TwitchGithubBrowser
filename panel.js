var twitch = window.Twitch.ext;

var user = "Xinchro"
var repo = "TwitchGithubBrowser"
var repoURL = "//github.com/"+user+"/"+repo+"/"
var URL = "//api.github.com/repos/"+user+"/"+repo+"/contents/"
var dirs = []

twitch.onAuthorized(authenticated)
twitch.configuration.onChanged(loadData)

function authenticated(auth) {
  
}

function loadData() {
  setVars(twitch.configuration)
  browseNext(false, '')
}

function setVars(data) {
  console.log(data)
  try {
    var broadcaster = JSON.parse(data.broadcaster.content)
    console.log(broadcaster)
  } catch(e) {
    var broadcaster = { username: "error", repo: "error" }
  }

  repoURL = "//github.com/"+broadcaster.user+"/"+broadcaster.repo+"/"
  URL = "//api.github.com/repos/"+broadcaster.user+"/"+broadcaster.repo+"/contents/"

  document.getElementById("user").href = "//github.com/"+user
  document.getElementById("repo").href = "//github.com/"+user+"/"+repo
  Array.from(document.getElementsByClassName("nav-item")).forEach(function(ele) {ele.target="_blank"})
}

function goBack() {
  dirs.pop()
  browseNext(false, '')
}

function browseNext(event, newDir) {
  if(event) event.preventDefault()
  
  if(newDir !== '') dirs.push(newDir)
  console.log("browsing", dirs)
  
  var xhttp = new XMLHttpRequest()
  xhttp.open("GET", URL + dirs.join('/'), false);
  xhttp.send();
  
  try {
    var data = JSON.parse(xhttp.responseText)  
  } catch(e) {
    console.error("failed to parse JSON")
    console.error(xhttp.responseText)
    throw(e)
  }
  
  var browserList = document.getElementById('browser-list')
  var text = ''
  for(var i=0;i<data.length;i++) {
    if(data[i].type.toLowerCase() === 'file') {
      text += '<li class="browser-element"><a class="file" target="_blank" href="' + data[i]._links.html + '">' + data[i].name + "</a></li>"
    }

    if(data[i].type.toLowerCase() === 'dir') {
      var onclick = "browseNext(event, '" + data[i].name + "')"
      text += '<li class="browser-element"><a class="dir" onclick="' + onclick + '">&gt;&nbsp;' + data[i].name + '</a></li>'
    }
  }
  
  browserList.innerHTML = text
}
